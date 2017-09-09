import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Dimensions
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getAllGameChallenges, setGamePoints, updatedTeams } from '../../actions/index.js'
import config from '../../../config/config';
import { GiftedChat } from 'react-native-gifted-chat';
import io from 'socket.io-client';

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ getAllGameChallenges, setGamePoints, updatedTeams }, dispatch)
}

const mapStateToProps = (state) => {
  return {
    userId: state.client.userIdentity,
    gameId: state.play.gameId,
    gameInfo: state.play.gameInfo,
    challenges: state.play.allChallenges,
    gamePoints: state.play.gamePoints,
    currentGameTeam1: state.play.currentGameTeam1,
    currentGameTeam2: state.play.currentGameTeam2
  }
}


class Lobby extends Component {
  constructor(props) {
    super(props);
    this.onSend = this.onSend.bind(this);
    this.onReceivedMessage = this.onReceivedMessage.bind(this);
    this._storeMessages = this._storeMessages.bind(this);
    this.onReceivedJoinedLobby =  this.onReceivedJoinedLobby.bind(this);
    this.updateOtherPlayer = this.updateOtherPlayer.bind(this);
    this.getOtherUserName = this.getOtherUserName.bind(this);
    this.startGame = this.startGame.bind(this);

    this.roomName = 'lobby' + this.props.gameId;
  
    this.state = {
      messages: [],
      totalPlayer: 0,
      user: {  
        _id: 1,
        name: '1'
      },
      team1: [],
      team2: [],
      styles: {},
      showStart: true
    };
  }

  componentWillMount() {
    //make a call to the database for games
    //load the markers into 
    //console.log(`im in Lobby.js componentWillMount`)
    fetch(`${config.localhost}/api/challenge/findChallengeByGameId/?gameId=${this.props.gameId}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(`Lobby.js - componentWillMount() - this is the data received ${JSON.stringify(data)}`);
      this.props.getAllGameChallenges(data);
    })
    .catch((err) => {
      console.error(err);
    });

    this.setState({ styles });
  }  

  componentDidMount() {
    this.socket = io(config.localhost);
    this.socket.emit('createRoom',  this.roomName);
    this.socket.on('joinLobby', this.onReceivedJoinedLobby);
    this.socket.on('message', this.onReceivedMessage);
    this.socket.on('updateOtherPlayer', this.updateOtherPlayer);
    this.socket.on('getOtherUserName', this.getOtherUserName);
    this.socket.on('startGame', this.startGame);
  }

  onReceivedJoinedLobby() {
   
    if(this.state.totalPlayer > 8) return;
    this.state.totalPlayer++;
    let team; 
    let teamName;

    if(this.state.totalPlayer === 1) {
      if (this.state.totalPlayer % 2 !== 0) {
        team = this.state.team1;
        team.push(this.props.userId);
        teamName = 'team1';
      } else {
        team = this.state.team2;
        team.push(this.props.userId);
        teamName = 'team2';
      }
    
      this.setState({ 
        [teamName]: team,
      });
    } 
    
    this.setState({
      totalPlayer: this.state.totalPlayer
    });

    let obj = {};
    obj.roomName = this.roomName;
    obj.totalPlayer = this.state.totalPlayer;
    obj.team1 = this.state.team1;
    obj.team2 = this.state.team2;
    obj.userId = this.props.userId;

    this.socket.emit('getOtherUserName', obj);
  }

  getOtherUserName(obj) {
    if(this.state.totalPlayer > obj.totalPlayer) {
      let team;
      let teamName;
      if (this.state.totalPlayer % 2 !== 0) {
        team = this.state.team1;
        team.push(obj.userId);
        teamName = 'team1';       
      } else {
        team = this.state.team2;
        team.push(obj.userId);
        teamName = 'team2';
      }
      this.setState({ 
        [teamName]: team,
      });

      let message = {};
      message.roomName = this.roomName;
      message.team1 = this.state.team1;
      message.team2 = this.state.team2;
      message.totalPlayer = this.state.totalPlayer;

      this.props.updatedTeams({
        team1: message.team1,
        team2: message.team2
      });

      this.socket.emit('updateOtherPlayer', message);
    }
  }

  updateOtherPlayer(message) {   
    if(message.totalPlayer > this.state.totalPlayer) {
      console.log('update other players tttttttttttttttttttt' + this.state.totalPlayer );
      if(this.state.totalPlayer === 1) {
        let id = (message.totalPlayer % 2 === 0) ? 2 : 1;
        let user = {
          _id: id,
          name: id + ''
        };
        this.setState({
          user
        });
      }
     
      this.setState({ 
        team1: message.team1,
        team2: message.team2,
        totalPlayer: message.totalPlayer,
      });  

      this.props.updatedTeams({
        team1: message.team1,
        team2: message.team2
      });
  } 

  if(this.state.totalPlayer >= 2) {
    this.setState({ showStart: true });
  }
}



  onReceivedMessage(messages=[]) {
    console.log('Message was recieved', messages);
    this._storeMessages(messages);
  }

  startGame() {
    this.props.setGamePoints(this.props.gameInfo.rewardPoints);
    console.log('Lobby: button pressed, props.gamedata is: ', this.props.gamedata)
    Actions.gameplay(this.props.gamedata);
  }

  onSend(messages=[]) {
    messages[0].roomName = this.roomName;
    messages[0].image = '';
    this.socket.emit('message', messages[0]);
    this._storeMessages(messages);
  }

  render() {
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5F9EA0',
      },
      welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
        color: '#ffffff',
      },
    });
    
    return (
      <View style={this.state.styles.container}>
        <Text style={this.state.styles.lobbytext}>Welcome to the Lobby</Text>
        <View style={this.state.styles.chat}>
            <GiftedChat  
              messages={this.state.messages}
              onSend={this.onSend}
              user={this.state.user}
              />
          </View>
          <View style={this.state.styles.divide}>
            <View style={this.state.styles.playerL}>
              <Text style={this.state.styles.team}> Team 1 </Text>
              {this.state.team1.map((val, key) => {
                return (<Text key={key}>   {val}</Text>)
              })}
            </View>
            <View style={this.state.styles.playerR}>
              <Text style={this.state.styles.team}> Team 2 </Text>
              {this.state.team2.map((val, key) => {
                return (<Text key={key}>   {val}</Text>)
              })}
            </View>
          </View>
          {this.state.showStart ? 
          <Button style={this.state.styles.button} onPress={() => {this.socket.emit('startGame', this.roomName);}} 
          title='START GAME'  
        /> : null
          }
      </View>
      
    );
  }

  _storeMessages(messages) {
    if(messages.text !== undefined && messages.text.length >= 6 && messages.text.substring(0,5) === '@team' && messages.user._id === this.state.user._id) {
      messages.text = messages.text.substring(6);
      this.setState((previousState) => {
        return {
          messages: GiftedChat.append(previousState.messages, messages)
        };
      });
    } else if(messages.text !== undefined && messages.text.substring(0,5) !== '@team') {
      this.setState((previousState) => {
        return {
          messages: GiftedChat.append(previousState.messages, messages)
        };
      });
    }
   
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    alignItems:'center',
    backgroundColor: '#5F9EA0' 
  },
  lobbytext: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10
  },
  divide: {
    flexDirection: 'row',   
  },
  chat: {
    width: Dimensions.get('window').width - 15,
    height: (Dimensions.get('window').height / 2),
    margin: 10,
    backgroundColor: '#ff372c',
  },
  playerL: {
    width: (Dimensions.get('window').width / 2) - 15,
    height: (Dimensions.get('window').height / 6),
    margin: 10,
    marginRight: 5,
    backgroundColor: '#5fffd7',
  },
  playerR: {
    width: (Dimensions.get('window').width / 2) - 15,
    height: (Dimensions.get('window').height / 6),
    margin: 10,
    marginLeft: 5,
    backgroundColor: '#5fffd7',
  },
  team: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 15
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);
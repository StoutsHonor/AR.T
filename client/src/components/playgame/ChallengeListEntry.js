import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Image,
  View,
  Modal,
  TouchableHighlight
} from 'react-native';
import { Card } from 'react-native-elements';
import config from '../../../config/config';

class ChallengeListEntry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayType: 2,
      displayInfo: false,
      color: '#A9A9A9'
    }
  }
  
  componentDidMount() {
    if(this.props.challengeIndex < this.props.index) {
      this.setState({displayType: 0});
      this.setState({displayInfo: true});
      this.setState({color: '#008000'})
    }
    if(this.props.challengeIndex === this.props.index) {
      this.setState({displayType: 1});
      this.setState({displayInfo: true});
      this.setState({color: '#FFD700'})
    }
    if(this.props.challengeIndex > this.props.index) {
      this.setState({displayType: 2});
    }
  }
  render() {
    return (
      <View>
        <Card title={this.props.challengeIndex + 1} backgroundColor={this.state.color}> 
          {this.state.displayInfo ? 
            <Text>{this.props.challenge.name}</Text> :
            <Image
              style={{width: 60, height: 60}}
              source={{uri: 'http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons/matte-red-and-white-square-icons-business/122828-matte-red-and-white-square-icon-business-lock6-sc48.png'}}
            />}
          <View >
          {/* <Modal
            animationType={"slide"}
            transparent={false}
            visible={this.state.showReview}
            onRequestClose={() => {alert("Modal has been closed.")}}
            >
            <View style={{marginTop: 22}}>
              <View>
                {this.state.reviews.map( (review, index) => {
                  <Review review={review} key={index}/>
                })}
                <TouchableHighlight onPress={() => {
                  this.setState({showReview: false});
                }}>
                  <Text>Back to Games</Text>
                </TouchableHighlight>

              </View>
            </View>
          </Modal> */}
          </View>
        </Card>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#808000'
  }
});

export default ChallengeListEntry;
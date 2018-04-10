import React from 'react';
import axios from 'axios';
import { Segment, Header, Form, TextArea, Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setFlash } from '../actions/flash';
import { addMessage, getMessages } from '../actions/messages';
import ChatMessage from './ChatMessage';
import { startTyping, stopTyping } from '../actions/isTyping';


class ChatWindow extends React.Component {
  state = { newMessage: '', }

  componentDidMount() {
    const { dispatch } = this.props;
    window.MessageBus.start() //this is the actual browser windwo. as soon as the window is loade lets start message bus.
    //then subscribe to message bus from a chanel.
    dispatch(setFlash('Welcome To My Chat App', 'green'))
    dispatch(getMessages()); //lets listen for new messages first and then grab old messages asyncronisly.
    //these may come in in the wrong order. so instead of just mapping we sort and map using the byTime function we created below.
    window.MessageBus.subscribe('/typing', (data) => {
      data.typing ?
        dispatch(startTyping(data.id))
        :
        dispatch(stopTyping(data.id))
    }) //next we need to hit our controller when we stop typing
    //name this '/chat_channel' anuthing you want as long as it matches the channel below..?
    window.MessageBus.subscribe('/chat_channel', (data) => { 
      dispatch(addMessage(JSON.parse(data))); //needed to add this JSON bc after we saved the messages tot the data base we were getting a json objecy back rather than a parsed josn object.
    });
    
  }

  componentWillUnmount() {
    window.MessageBus.unsubscribe('/chat_channel')
  }

  byTime = (x,y) => {
    if (x.created_at > y.created_at)
      return 1
    if (x.created_at < y.created_at)
      return -1
    return 0
  }

  displayMessages = () => {
    const { messages } = this.props;

    if (messages.length)
      return messages.sort(this.byTime).map( (message, i) => {
        return <ChatMessage key={i} message={message} />
      })
      //Need both returns because the second one in is  {}, if you take out the {} you can inplicet return with  ...,i) => <ChatMessage....
    else 
      return (
        <Segment inverted textAlign="center">
          <Header as='h1'>No Messages Yet</Header>
        </Segment>
      )
  }

  startTyping = () => {
    axios.post('/api/typing', { typing: true })
      .then( ({ headers }) => this.props.dispatch({ type: 'HEADERS', headers }) )
  }

//TODO??
  stopTyping = () => {
    axios.post('/api/typing')
    .then( ({ headers }) => this.props.dispatch({ type: 'HEADERS', headers }) )
  }

  addMessage = (e) => {
    e.preventDefault();
    this.stopTyping();
    const { dispatch, user: { email }} = this.props;
    const { newMessage } = this.state;
    const message = { email, body: newMessage };

    axios.post('/api/messages', message)
      .then( ({ headers }) => {
        dispatch({ type: 'HEADERS', headers })
        this.setState({ newMessage: '' })
      })
      .catch( ({ headers }) => {
        dispatch({ type: 'HEADERS', headers })
        dispatch(setFlash('Error Posting Messages', 'red'))
      });
      //we're now not dispatching messages, we are listening for messages using message bus
    // dispatch(addMessage(message));
    // this.setState({ newMessage: '' })
  }

  setMessage = (e) => {
    const { newMessage } = this.state;
    const { value } = e.target;
    if (newMessage && !value)
      //STOPPED typing
      this.stopTyping()
    else
      //Typing
      this.startTyping()

    this.setState({ newMessage: e.target.value })
  }

  render() {
    const { isTyping } = this.props;
    return (
      <Segment basic>
        <Header as='h3' testAlign="center" style={styles.underline}>
          React Chat
        </Header>
        <Segment basic style={styles.mainWindow}>
          <Segment basic>
            {this.displayMessages()}
            { isTyping.length > 0 && <Header as='h5'>Someone is typing...</Header> }
          </Segment>
        </Segment>
        <Segment style={styles.messageInput}>
          <Form onSubmit={this.addMessage}>
            <TextArea
              value={this.state.newMessage} 
              onChange={this.setMessage} 
              placeholder="Write something nice!" 
              autofocus 
              required>
            </TextArea>
            <Segment basic textAlign="center">
              {/* <Button type="button" primary>Clear Form</Button> // this ="button" make sit look like a button but it doesn;t actually do anything. */}
              <Button type="submit" primary>Send Message</Button>
            </Segment>
          </Form>
        </Segment>
      </Segment>
    )
  }
}

const styles = {
  underline: {
    textDecoration: 'underline',
  },
  mainWindow: {
    border: '3px solid black',
    height: '60vh', //60% of view height
    overflowY: 'scroll', //if the stuff inside goes outside the 60% vh then scroll (this is the y axis)
    backgroundColor: 'lightgrey',
    borderRadius: '10px',
  },
  messageInput: {
    borderRadius: '10px',
    width: '80%',
    margin: '0 auto', // margin left and margin right -> make the right and left margins equal, it should make it center, but it rarely works.
    padding: '10px',
  },

}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    messages: state.messages,
    isTyping: state.isTyping,
  }
}

export default connect(mapStateToProps)(ChatWindow);
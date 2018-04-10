import axios from 'axios';

export const getMessages = (messages) => {
  return ( dispatch) => {
    axios.get('/api/messages')
      .then( ({ data: messages, headers }) => {
        dispatch( 
          {
            type: 'GET_MESSAGES',
            messages, 
            headers,
          }
        )
      }).catch( ({ headers }) => dispatch({ type: 'HEADERS', headers }) )
  }
}

export const addMessage = (message) => {
  return {
    type: 'ADD_MESSAGE',
    message,
  }
}
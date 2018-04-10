const messages = (state = [], action) => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return [...state, action.message]
    case 'GET_MESSAGES':
      return action.messages
    default:
      return state
  }
}

export default messages;
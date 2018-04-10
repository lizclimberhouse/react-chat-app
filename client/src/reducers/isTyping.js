const isTyping = (state = {}, action ) => {
  switch (action.type) {
    case 'START_TYPING':
      return [...new Set([...state, action.id])] // this will garentee that we don't add a user twice. if they are typing add teh user id to an array, if not remove them from the array.
    case 'STOP_TYPING':
      return state.filter( u => u !== action.id )
    default:
      return state;
  }
}

export default isTyping;
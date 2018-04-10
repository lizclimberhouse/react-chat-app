export const startTyping = (id) => {
  return {
    type: 'START_TYPING', id
  }
}

export const stopTyping = (id) => {
  return {
    type: 'STOP_TYPING', id
  }
}
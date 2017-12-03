const TestErrorAsync = () => {
  const errorPromise = new Promise(() => {
    // TODO: currently not handled
    throw new Error('[TestErrorAsync] test error, currently not handled')
  })

  return 'wait'
}

export { TestErrorAsync }

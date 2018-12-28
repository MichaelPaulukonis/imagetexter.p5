describe('default sketch page tests', () => {
  describe('Should display the default sketch page with expected elements...', () => {
    const suppliedText = 'What words? Deadlocked. Explosion. Tangible flippant excesses. Pickle. Noodle noodle noodle.'
    beforeEach(() => {
      // Because we're only testing the homepage
      // in this test file, we can run this command
      // before each individual test instead of
      // repeating it in every test.
      // TODO: need to be able to pass in what image to use
      // url so not everything in library
      // but locally, URL could be local
      cy.visit(`/?text=${suppliedText}&autoPaintGrid=true&autoSave=true`)
      cy.wait(3000)
    })
    it('... bodycopy contains supplied text', () => {
      cy.get('#bodycopy')
        .should('be.visible')
      cy.get('#sketch-holder > canvas')
        .should('be.visible')
        .trigger('mousemove', 200, 200)
      cy.get('body').type('g') // okay, nothing happens. AAAARGH
      cy.wait(1000)
    })
  })
})

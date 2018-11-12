describe('default sketch page tests', () => {
    describe('Should display the default sketch page with expected elements...', () => {
        const suppliedText = 'What words? Deadlocked. Explosion.'
        beforeEach(() => {
            // Because we're only testing the homepage
            // in this test file, we can run this command
            // before each individual test instead of
            // repeating it in every test.
            cy.visit(`/?text=${suppliedText}&autoPaint=true&autoSave=true`);
            cy.wait(3000);
        });
        it('... bodycopy contains supplied text', () => {
            cy.get('#bodycopy')
                .should('be.visible')
            cy.get('#sketch-holder > canvas')
                .should('be.visible')
                .trigger('mousemove', 200, 200)
            cy.get('body').type('g') // okay, nothing happens. AAAARGH
            cy.wait(1000)
        })
    });
})
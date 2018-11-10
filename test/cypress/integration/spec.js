describe('default sketch page tests', () => {
    describe('Should display the default sketch page with expected elements...', () => {
        beforeEach(() => {
            // Because we're only testing the homepage
            // in this test file, we can run this command
            // before each individual test instead of
            // repeating it in every test.
            cy.visit('/');
        });
        // By using `data-qa` selectors, we can separate
        // CSS selectors used for styling from those used
        // exclusively for testing our application.
        // See: https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements
        it('... has a canvas', () => {
            // p5js creates the canvas with a predefined id that we have no control over
            cy.get('#sketch-holder > canvas').should('be.visible');
        })
        it('... has bodycopy', () => {
            cy.get('#bodycopy').should('be.visible');
        })
        it('... has applytext button', () => {
            const at = cy.get('#applytext')
            at.should('be.visible');
        })
        it('... has focus (on canvas) element', () => {
            cy.get('#focus').should('be.visible');
        })
    });
})
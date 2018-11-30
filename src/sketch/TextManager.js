export default class TextManager {
  constructor (text) {
    var defaultText = `Come unto these yellow sands,
And then take hands:
Curtsied when you have, and kiss'd
The wild waves whist,
Foot it featly here and there;
And, sweet sprites, the burthen bear.
Hark, hark!
Bow-wow.
The watch-dogs bark.
Bow-wow.
Hark, hark! I hear
The strain of strutting chanticleer
Cry, Cock-a-diddle-dow.
Full fathom five thy father lies;
Of his bones are coral made;
Those are pearls that were his eyes:
Nothing of him that doth fade,
But doth suffer a sea-change
Into something rich and strange.
Sea-nymphs hourly ring his knell:
Ding-dong.
Hark! now I hear them—Ding-dong, bell.`
    var SPLIT_TOKENS = '[ ?.,;:<>()"]'
    var charIndex = 0
    var wordIndex = 0
    let self = this
    self.words = []
    self.getchar = function () {
      var c = self.w.charAt(charIndex)
      charIndex = (charIndex + 1) % self.w.length
      return c
    }
    self.getcharRandom = function () {
      return self.w.charAt(Math.floor(Math.random() * self.w.length))
    }
    self.getWord = function () {
      var word = self.words[wordIndex]
      wordIndex = (wordIndex + 1) % self.words.length
      return word
    }
    self.getText = function () {
      return self.w
    }
    self.setText = function (text) {
      self.w = text
      self.words = self.w.split(new RegExp(SPLIT_TOKENS, 'g'))
      wordIndex = 0
      charIndex = 0
    }

    self.setText(text || defaultText)
  }
}

# imagetexter
Paints with text using colors from a backing image.

p5.js version from an [older processing.js version](https://github.com/MichaelPaulukonis/processing/tree/master/2014/ImageTexter)

Also online @ https://michaelpaulukonis.github.io/imagetexter.p5/

# usage
 - click and drag on canvas to "paint"
 - 1,2,3,4 select different backing images
 - drag-n-drop image onto canvas to use a different backing image
 - `delete` to clear canvas
 - `g` to paint a grid of text
 - `s` save canvas locally
 - `a` toggle _auto paint mode_ (paint text and random location without needing to click)
 - `m` change paint mode
 - `r` toggle _random size mode_
 - `x` swap black|white background
 - `UP|DOWN` change text size
 - `RIGHT|LEFT` change amount of jitter (for random size)

# roadmap
 - headless automation (given image and text, output file)
 - upload image to use/add to local library
  - drag-n-drop has been started
 - GUI for minor feedback (try something other than dat.gui for a change)
  - thumbnail of current image/image "library"
  - text input


## recently added features
 - drag-n-drop
 - resize on drop
 - save fixed
 - ability to change text

## image sources
  - [Motherwell's Elegy to the Spanish Republic)[https://www.flickr.com/photos/clairity/19325098566]
https://images.nga.gov/en/set/show_content_page.html?category=16&set=11&qw=
https://archive.org/details/metropolitanmuseumofart-gallery?&sort=-downloads
https://www.pablopicasso.org/picasso-paintings.jsp
https://pixabay.com/en/photos/?q=random&hp=&image_type=photo&order=popular&cat=&min_width=&min_height=
https://www.pluralsight.com/guides/using-the-unsplash-api
https://github.com/YahiaElTai/cool-images
https://github.com/nimojs/unsplash
https://www.npmjs.com/package/random-flickr
https://medium.com/quick-code/how-to-quickly-generate-a-random-gallery-of-images-from-an-unsplash-collection-in-javascript-4ddb2a6a4faf


# build and deploy
1. commit existing code
1. `npm run bump`
1. `npm run build`
1. `npm run deploy`



const plateInput = document.getElementById('plate');
const stateInput = document.getElementById('state');
const parked = document.getElementById('parked');
const profile = document.getElementById('profile');
const commentsBox = document.getElementById('comments');
const commentInput = document.getElementById('comment');
const ratingInput = document.getElementById('rating');
const ratingChoices = document.querySelectorAll('input[name="stars"]');
const ratingFill = document.getElementById('rating-fill');
const ratingLabel = document.getElementById('rating-label');
const averageBox = document.getElementById('average-rating');
const searchMessage = document.getElementById('search-message');
const commentMessage = document.getElementById('comment-message');

// Keep the same key so older saved comments still load.
const storageKey = 'lanekind-comments-v1';
let vehicles = [];
let savedComments = [];
let currentPlate = '';
let currentState = '';
let ready = false;

function paintRating(rating) {
  ratingFill.textContent = '★★★★★';
  ratingFill.style.width = (rating / 5 * 100) + '%';
  ratingLabel.textContent = rating ? rating + ' out of 5 stars' : 'Choose a rating.';
}

function resetRating() {
  ratingInput.value = '';
  for (const choice of ratingChoices) choice.checked = false;
  paintRating(0);
}

for (const choice of ratingChoices) {
  choice.addEventListener('change', function () {
    ratingInput.value = choice.value;
    paintRating(Number(choice.value));
  });

  choice.nextElementSibling.addEventListener('pointerenter', function (event) {
    if (event.pointerType === 'mouse') paintRating(Number(choice.value));
  });
}

document.getElementById('rating-picker').addEventListener('pointerleave', function () {
  paintRating(Number(ratingInput.value));
});

function validRating(rating) {
  return typeof rating === 'number' && rating >= 1 && rating <= 5 &&
    Number.isInteger(rating * 2);
}

function readComments() {
  const comments = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!Array.isArray(comments)) throw new Error('Invalid saved comments');

  for (const comment of comments) {
    if (!comment || typeof comment.id !== 'string' ||
        typeof comment.plate !== 'string' || typeof comment.state !== 'string' ||
        typeof comment.text !== 'string' || !comment.text.trim() ||
        comment.text.length > 500 || !Number.isFinite(Date.parse(comment.createdAt))) {
      throw new Error('Invalid saved comment');
    }
    // Older comments can have no rating.
    if (comment.rating != null && !validRating(comment.rating)) {
      throw new Error('Invalid saved rating');
    }
  }
  return comments;
}

async function start() {
  try {
    savedComments = readComments();
  } catch {
    searchMessage.textContent = 'Saved comments could not be loaded.';
  }

  try {
    const response = await fetch('data/vehicles.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Vehicle file missing');
    const data = await response.json();
    if (!Array.isArray(data.vehicles)) throw new Error('Invalid vehicle file');

    for (const car of data.vehicles) {
      if (!car || typeof car.plate !== 'string' || typeof car.state !== 'string' ||
          !Array.isArray(car.comments)) throw new Error('Invalid vehicle');
      for (const comment of car.comments) {
        if (!comment || typeof comment.id !== 'string' ||
            typeof comment.text !== 'string' ||
            (comment.rating != null && !validRating(comment.rating))) {
          throw new Error('Invalid comment or rating');
        }
      }
    }

    vehicles = data.vehicles;
    ready = true;
    document.getElementById('search-button').disabled = false;
    document.getElementById('search-button').textContent = 'Find Vehicle';
  } catch {
    searchMessage.textContent = 'Could not load data/vehicles.json. Check the file and open the site through GitHub Pages or your local server.';
    document.getElementById('search-button').textContent = 'Unable to Load';
  }
}

function findVehicle(event) {
  event.preventDefault();
  if (!ready || !parked.checked) return;

  const plate = plateInput.value.trim().toUpperCase().replace(/[\s-]+/g, '');
  if (!/^[A-Z0-9]{1,8}$/.test(plate)) {
    searchMessage.textContent = 'Enter 1 to 8 letters or numbers.';
    return;
  }

  currentPlate = plate;
  currentState = stateInput.value;
  plateInput.value = plate;
  profile.hidden = false;
  commentInput.value = '';
  resetRating();
  searchMessage.textContent = '';
  commentMessage.textContent = '';
  document.getElementById('profile-title').textContent = plate + ' / ' + currentState;
  showComments();
  document.getElementById('profile-title').focus();
}

function useExample(plate, state) {
  plateInput.value = plate;
  stateInput.value = state;
  plateInput.form.requestSubmit();
}

function checkParked() {
  if (!parked.checked) {
    profile.hidden = true;
    currentPlate = '';
    currentState = '';
  }
}

function makeStars(rating) {
  const stars = document.createElement('span');
  stars.className = 'stars';
  stars.setAttribute('role', 'img');
  stars.setAttribute('aria-label', Number(rating.toFixed(2)) + ' out of 5 stars');

  const background = document.createElement('span');
  background.textContent = '★★★★★';
  background.setAttribute('aria-hidden', 'true');

  const fill = document.createElement('span');
  fill.className = 'star-fill';
  fill.textContent = '★★★★★';
  fill.setAttribute('aria-hidden', 'true');
  fill.style.width = (rating / 5 * 100) + '%';

  stars.append(background, fill);
  return stars;
}

function showComments() {
  commentsBox.replaceChildren();
  let comments = [];

  for (const vehicle of vehicles) {
    if (vehicle.plate === currentPlate && vehicle.state === currentState) {
      comments = vehicle.comments.slice();
    }
  }
  for (const comment of savedComments) {
    const sameVehicle = comment.plate === currentPlate && comment.state === currentState;
    if (sameVehicle && !comments.some(item => item.id === comment.id)) comments.push(comment);
  }

  let total = 0;
  let count = 0;
  for (const comment of comments) {
    if (validRating(comment.rating)) {
      total += comment.rating;
      count++;
    }
  }

  averageBox.replaceChildren();
  if (count === 0) {
    averageBox.textContent = 'No ratings yet.';
  } else {
    const average = total / count;
    const summary = document.createElement('span');
    summary.textContent = ' Average: ' + Number(average.toFixed(2)) +
      ' / 5 (' + count + (count === 1 ? ' rating)' : ' ratings)');
    averageBox.append(makeStars(average), summary);
  }

  if (comments.length === 0) commentsBox.textContent = 'No comments yet.';

  for (const comment of comments) {
    const note = document.createElement('div');
    note.className = 'note';
    const label = document.createElement('small');
    label.textContent = comment.source === 'sample' ? 'Example comment' : 'Comment';

    const ratingLine = document.createElement('div');
    ratingLine.className = 'note-rating';
    if (validRating(comment.rating)) {
      const number = document.createElement('span');
      number.textContent = ' ' + comment.rating + ' / 5';
      ratingLine.append(makeStars(comment.rating), number);
    } else {
      ratingLine.textContent = 'Not rated';
    }

    const text = document.createElement('p');
    text.textContent = comment.text;
    note.append(label, ratingLine, text);

    const savedHere = savedComments.some(item => item.id === comment.id);
    const inFile = vehicles.some(car => car.comments.some(item => item.id === comment.id));
    if (savedHere && !inFile) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Delete';
      button.onclick = function () { deleteComment(comment.id); };
      note.append(button);
    }
    commentsBox.append(note);
  }
}

function saveComment(event) {
  event.preventDefault();
  if (!currentPlate || !parked.checked) return;

  const rating = Number(ratingInput.value);
  const text = commentInput.value.trim();
  if (!validRating(rating)) {
    commentMessage.textContent = 'Choose a rating from 1 to 5, in half-star steps.';
    return;
  }
  if (!text || text.length > 500) {
    commentMessage.textContent = 'Write a comment between 1 and 500 characters.';
    return;
  }

  try {
    const comments = readComments();
    comments.push({
      id: crypto.randomUUID(),
      plate: currentPlate,
      state: currentState,
      text: text,
      rating: rating,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(storageKey, JSON.stringify(comments));
    savedComments = comments;
    commentInput.value = '';
    resetRating();
    showComments();
    commentMessage.textContent = 'Rating and comment saved in this browser.';
  } catch {
    commentMessage.textContent = 'Could not save. Your comment is still in the box; copy it before leaving.';
  }
}

function deleteComment(id) {
  try {
    const comments = readComments().filter(comment => comment.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(comments));
    savedComments = comments;
    showComments();
    commentMessage.textContent = 'Rating and comment deleted.';
    commentInput.focus();
  } catch {
    commentMessage.textContent = 'Could not delete the comment.';
  }
}

window.addEventListener('storage', function (event) {
  if (event.key === storageKey || event.key === null) {
    try {
      savedComments = readComments();
      if (currentPlate) showComments();
    } catch {
      commentMessage.textContent = 'Saved comments could not be updated.';
    }
  }
});

start();

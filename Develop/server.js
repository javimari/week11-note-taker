// Import necessary modules
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // UUID for generating unique IDs for notes

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3000; // Set the port, defaulting to 3000

// Middleware for handling JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' directory

// Route to serve the notes HTML page
app.get('/notes', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html')); // Serve notes.html file
});

// API route to retrieve all notes
app.get('/api/notes', (_req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading notes:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(JSON.parse(data)); // Respond with parsed JSON data
  });
});

// API route to create a new note
app.post('/api/notes', (req, res) => {
  const newNote = { ...req.body, id: uuidv4() }; // Create a new note object with a unique ID
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading notes:', err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }
    const notes = JSON.parse(data); // Parse the existing notes
    notes.push(newNote); // Add the new note to the array
    fs.writeFile('./db/db.json', JSON.stringify(notes, null, 2), err => {
      if (err) {
        console.error('Error saving note:', err);
        return res.status(500).json({ error: 'Failed to save note' });
      }
      res.json(newNote); // Respond with the newly created note
    });
  });
});

// API route to delete a note by its ID
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id; // Extract the note ID from the request parameters
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading notes for deletion:', err);
      return res.status(500).json({ error: 'Failed to read notes for deletion' });
    }
    let notes = JSON.parse(data); // Parse the existing notes
    notes = notes.filter(note => note.id !== noteId); // Filter out the note with the given ID
    fs.writeFile('./db/db.json', JSON.stringify(notes, null, 2), err => {
      if (err) {
        console.error('Error deleting note:', err);
        return res.status(500).json({ error: 'Failed to delete note' });
      }
      res.json({ message: 'Note deleted successfully' }); // Respond with a success message
    });
  });
});

// Catch-all route to serve the index HTML page for all non-API routes
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve index.html file
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

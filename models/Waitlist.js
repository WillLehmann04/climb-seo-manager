import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema({
    // Define your waitlist schema based on your actual MongoDB structure
    // Adjust these fields to match your actual data
    email: String,
    name: String,
    company: String,
    website: String,
    message: String,
    source: String,
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: 'pending' },
}, {
    timestamps: true,
    strict: false // Allow fields not defined in schema
});

export const Waitlist = mongoose.model('Waitlist', waitlistSchema, 'waitlist');


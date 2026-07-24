import { v4 as uuidv4 } from 'uuid';
import DemoRequestModel from '../models/DemoRequestModel.js';

export const createDemoRequest = async (req, res) => {
  try {
    const { fullName, email, company, companySize, preferredDate, interest, message } = req.body;

    const newRequest = {
      id: uuidv4(),
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      company: company.trim(),
      companySize,
      preferredDate,
      interest,
      message: message.trim(),
      attachmentPath: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date().toISOString(),
    };

    const saved = await DemoRequestModel.create(newRequest);
    res.status(201).json({ success: true, message: 'Demo request submitted successfully.', data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit demo request.', error: err.message });
  }
};

export const getAllDemoRequests = async (req, res) => {
  try {
    const requests = await DemoRequestModel.getAll();
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch demo requests.', error: err.message });
  }
};

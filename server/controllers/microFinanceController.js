const LoanApplication = require('../models/loanApplication');
const SamurdhiApplication = require('../models/samurdhiApplication');

exports.createLoanApplication = async (req, res) => {
  try {
    const loan = new LoanApplication(req.body);
    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLoanApplications = async (req, res) => {
  try {
    const loans = await LoanApplication.find({ residentId: req.params.residentId });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLoanApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLoan = await LoanApplication.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedLoan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteLoanApplication = async (req, res) => {
  try {
    await LoanApplication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Loan application deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSamurdhiApplication = async (req, res) => {
  try {
    const samurdhi = new SamurdhiApplication(req.body);
    await samurdhi.save();
    res.status(201).json(samurdhi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSamurdhiApplications = async (req, res) => {
  try {
    const samurdhiApps = await SamurdhiApplication.find({ residentId: req.params.residentId });
    res.json(samurdhiApps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSamurdhiApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSamurdhi = await SamurdhiApplication.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedSamurdhi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSamurdhiApplication = async (req, res) => {
  try {
    await SamurdhiApplication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Samurdhi application deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendAppointmentEmail = async (req, res) => {
  try {
    const { email, fullName, date, time, location, applicationType } = req.body;

    const documents = applicationType === 'Loan'
      ? ['NIC Copy', 'Proof of Income', 'Utility Bill', 'Loan Purpose Statement']
      : ['NIC Copy', 'Proof of Residence', 'Income Certificate', 'Family Details Document'];

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Appointment for Document Verification',
      text: `
📅 **Date**: ${date}
🕓 **Time**: ${time}
📍 **Location**: ${location}
📝 **Required Documents**:
${documents.map(doc => `- ${doc}`).join('\n')}

Please bring all original documents. If you are unable to attend, contact us at least 24 hours before the appointment.

Best regards,
**Institute Review Team**
eGrama Micro Finance System
      `,
    };

    const transporter = req.app.get('transporter');
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email: ' + error.message });
  }
};
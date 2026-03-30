exports.getProfile = async (req, res) => {
  const user = req.user;
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role, contact: user.contact, createdAt: user.createdAt });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, contact } = req.body;
    if (name) user.name = name;
    if (contact) user.contact = contact;
    await user.save();
    res.json({ message: 'Profile updated', user: { id: user._id, name: user.name, contact: user.contact, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

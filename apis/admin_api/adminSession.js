const establishAdminSession = (req, admin) => new Promise((resolve, reject) => {
  req.session.regenerate((error) => {
    if (error) return reject(error);
    req.session.user = {
      id: admin.id,
      role: String(admin.role).trim(),
      name: admin.name,
      email: admin.username,
    };
    req.session.save(saveError => saveError ? reject(saveError) : resolve(req.session.user));
  });
});

module.exports = { establishAdminSession };

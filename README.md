# Stateless Password Manager

SPM is a really simple password manager. It does not store any of
your password locally nor in the cloud. For each application (or website), a unique password is generated using your main password and the name of the application with a cryptographically secured hash function (scrypt).

Anytime you use SPM with your main password and the name of the website (or application) the same specific password is generated.
Everything is done in your browser and no communication are performed. You can even download the website and perform all this offline if you want.




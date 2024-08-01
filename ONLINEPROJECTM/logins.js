function redirectTo(role) {
    switch (role) {
      case 'faculty':
        window.location.href = 'flogin.html';
        break;
      case 'student':
        window.location.href = 'stulogin.html';
        break;
      case 'admin':
        window.location.href = 'adminlogin.html';
        break;
      default:
        break;
    }
  }
  
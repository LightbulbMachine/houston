Template._houston_login.helpers({
  logged_in() { return Meteor.user(); }
});

Template._houston_login.events({
  'submit #houston-sign-in-form'(e) {
    e.preventDefault();
    const email = $('input[name="houston-email"]').val();
    const password = $('input[name="houston-password"]').val();

    const afterLogin = function(error) {
      // TODO error case that properly displays
      if (error) {
        return alert(error);
      } else {
        Houston._go('home');
      }
    };

    if (Houston._admin_user_exists()) {
      Meteor.loginWithPassword(email, password, afterLogin);
    } else {
      Accounts.createUser({
        email,
        password
      }, function(error) {
        if (error) { return afterLogin(error); }
        Houston.becomeAdmin();
      });
    }
  },

  'click #houston-logout'(e) {
    e.preventDefault();
    Meteor.logout();
    // going 'home' clears the side nav
    Houston._go('home');
  },

  'click #become-houston-admin'(e) {
    e.preventDefault();
    Houston.becomeAdmin();
  }
});

Template._houston_login.rendered = () => $(window).unbind('scroll');

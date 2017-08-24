Template._houston_change_password.helpers({
  admin_user_exists() { return admin_user_exists(); }
});

Template._houston_change_password.events({
  'submit #houston-change-password-form'(e) {
    e.preventDefault();
    const current_password = $('input[name="houston-current-password"]').val();
    const new_password = $('input[name="houston-new-password"]').val();

    Accounts.changePassword(current_password, new_password, function(error) {
      if (error) {
        return alert(error);
      } else {
        Houston._go('home');
      }
    });
  }
});

Template._houston_change_password.rendered = () => $(window).unbind('scroll');

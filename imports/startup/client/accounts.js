var onSubmitFunc = function(error, state){
    if (!error) {
        if (state === "signIn") {
            FlowRouter.go('/');
        }
        if (state === "signUp") {
            FlowRouter.go('/profile');
        }
    }
};

AccountsTemplates.configure({
    enablePasswordChange: true,
    showForgotPasswordLink: true,
    onSubmitHook: onSubmitFunc
});

AccountsTemplates.addField({
    _id: "username",
    type: "text",
    displayName: "username",
    required: true,
    minLength: 5,
});
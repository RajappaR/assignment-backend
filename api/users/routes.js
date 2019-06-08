const userController = require('./controller');
const auth = require('../../utils/auth');

module.exports = router => {



    router.put('/users/:userId', auth.required, userController.editUser);

    router.post('/users', auth.required, userController.createUser);



    router.delete('/users/:userId', auth.required, userController.deleteUser);



    router.get('/users/:userId', auth.required, userController.getUser);



    router.get('/users', auth.required, userController.getAllUsers);


}
import bcrypt from "bcrypt";

export const hashPassword = (password) => {
    return new Promise((resolve, rejecct) => {
        bcrypt.genSalt(12, (err, salt) => {
            if(err){
                rejecct(err);
            }
            bcrypt.hash(password, salt, (err, hash)=> {
                if(err){
                    rejecct(err);
                }
                resolve(hash);
            });
        });
    });
};



export const comparePassword = (password, hashed) => {
    return bcrypt.compare(password, hashed);
};
class UserDto {
    constructor(name, last_name, email) {
        this.name = name;
        this.lastName = last_name;
        this.email = email;
    }
}

function parseUserDto(data) {
    const { name, last_name, email} = data;
    return new UserDto(name, last_name, email);
}

module.exports = {
    parseUserDto
}
const { clear } = require("node:console");
const fs = require("node:fs");

const filePath = __dirname + "/../data/users.json";
const dirPath = __dirname + "/../data";

const readFile = fileName => {
	if (!fs.existsSync(fileName)) {
		initFile(fileName);
		return [];
	}
	const data = fs.readFileSync(fileName, "utf-8");
	return JSON.parse(data);
};

const writeFile = (fileName, data) => {
	fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
};

const initFile = () => {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath);
	}
	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, JSON.stringify([]));
	}
};

const addUser = user => {
	if (!user || !user.email) {
		console.log("Invalid user data:", user);
		return;
	}

	if (getUserByEmail(user.email)) {
		console.log("User with this email already exists:", user.email);
		return;
	}

	try {
		const users = readFile(filePath);
		user.id = Date.now().toString();
		user.createdAt = new Date().toISOString();
		users.push(user);
		writeFile(filePath, users);
	} catch (err) {
		console.log("Error adding user:", err);
	}
};

const updatedUser = updatedUser => {
	try {
		const users = readFile(filePath);
		const index = users.findIndex(user => user.email === updatedUser.email);
		if (index !== -1) {
			users[index] = { ...users[index], ...updatedUser };
			writeFile(filePath, users);
		}
	} catch (err) {
		console.log("Error updating user:", err);
	}
};

const getUserByEmail = email => {
	try {
		const users = readFile(filePath);
		return users.find(user => user.email === email);
	} catch (err) {
		console.log("Error getting user by email:", err);
		return null;
	}
};

const getAllUsers = () => {
	try {
		const users = readFile(filePath);
		users.forEach(user => {
			delete user.password;
		});
		return users;
	} catch (err) {
		console.log("Error getting all users:", err);
		return [];
	}
};

module.exports = {
	addUser,
	updatedUser,
	getUserByEmail,
	getAllUsers,
};

const express = require("express");

const multer = require("multer");
const {
	addUser,
	updatedUser,
	getAllUsers,
	getUserByEmail,
} = require("./utils/jsonStore");

require("dotenv").config({ quiet: true });

const app = express();

app.use(express.json());
app.use(express.static("public"));

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "public/uploads/");
	},
	filename: (req, file, cb) => {
		cb(
			null,
			`${Date.now()}-${Math.round(
				Math.random() * 1e9
			)}.${file.originalname.split(".").at(-1)}`
		);
	},
	sizeLimit: 1024 * 1024 * 2,
	types: ["image/jpeg", "image/png", "image/webp"],
});

const upload = multer({ storage });

const uploadMiddleware = upload.single("profileImage");

app.get("/", (_, res) => {
	res.redirect("/login.html");
});

app.post("/api/register", (req, res) => {
	const {
		fullName,
		email,
		password,
		college,
		hobby,
		phone,
		age,
		city,
		github,
		bio,
	} = req.body;

	if (!fullName || !email || !password) {
		return res
			.status(400)
			.json({ ok: false, message: "All fields are required." });
	}

	addUser({
		fullName,
		email,
		password,
		imageURL: req.file ? `/uploads/${req.file.filename}` : null,
		college,
		hobby,
		phone,
		age,
		city,
		github,
		bio,
	});

	return res
		.status(201)
		.json({ ok: true, message: "User registered successfully." });
});

app.post("/api/uploadProfileImage", uploadMiddleware, (req, res) => {
	if (req.fileValidationError) {
		return res
			.status(400)
			.json({ ok: false, message: req.fileValidationError });
	}

	updatedUser({
		email: req.body.email,
		imageURL: req.file ? `/uploads/${req.file.filename}` : null,
	});

	return res.status(200).json({
		ok: true,
		message: "Image uploaded successfully.",
		imageURL: req.file ? `/uploads/${req.file.filename}` : null,
	});
});

app.post("/api/login", (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res
			.status(400)
			.json({ ok: false, message: "Email and password are required." });
	}

	const user = getUserByEmail(email);

	if (!user || user.password !== password) {
		return res
			.status(401)
			.json({ ok: false, message: "Invalid email or password." });
	}

	return res.status(200).json({
		ok: true,
		message: "Login successful.",
		user: {
			fullName: user.fullName,
			email: user.email,
			imageURL: user.imageURL,
			college: user.college,
			hobby: user.hobby,
			phone: user.phone,
			age: user.age,
			city: user.city,
			github: user.github,
			bio: user.bio,
		},
		token: jwt.sign({ email: user.email }, process.env.JWT_SECRET),
	});
});

app.get("/api/users", (_, res) => {
	const users = getAllUsers();
	return res.status(200).json({ ok: true, users });
});

app.listen(process.env.PORT || 3000, () => {
	console.log("Server is running on port " + (process.env.PORT || 3000));
});

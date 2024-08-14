const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const session = require("express-session");
const userdatamodel = require("./models/userdataschema");
const vegetablesmodel = require("./models/vegetables");
const floursmodel = require("./models/flours");
const ricemodel = require("./models/rice");
const dalsmodel = require("./models/dals");
const cartmodel = require("./models/cart");
const coffeemodel = require("./models/coffees");
const spicesmodel = require("./models/spices");
const snacksmodel = require("./models/snacks");
const milkmodel = require("./models/milks");
const saucesmodel = require("./models/sauces");
const oilmodel = require("./models/oils");
const cleaningmodel = require("./models/cleaners");
const hygienemodel = require("./models/hygiene");
const toiletariesmodel = require("./models/toiletaries");
const disposablesmodel = require("./models/disposables");
const orders = require('./models/orders');
const userOrderHistoryModel = require('./models/userorderhistory');
const twilio = require('twilio');

const app = express();
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
const secretKey = "e_COMMERce_10m2192nfaijnafe";

app.use(
	session({
		secret: "ECOMMERCE_GROCERY",
		resave: false,
		saveUninitialized: true,
	})
);

mongoose
	.connect("mongodb+srv://userbusy0198:userbusy@cluster0.1tijp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
	.then(() => {
		console.log("MongoDB connected");
	})
	.catch((error) => {
		console.error("MongoDB connection error:", error);
	});

app.get("/", (req, res) => {
	res.render("home", { loginstatus: req.session.status, adminstatus: false });
});

app.get("/home", (req, res) => {
	res.render("home", { loginstatus: req.session.status, adminstatus: false });
});

app.get("/adminhome", (req, res) => {
	res.render("home", { loginstatus: req.session.status, adminstatus: true });
});

app.get("/signup", (req, res) => {
	res.render("signup", {
		emailexists: false,
		mobileexists: false,
		adminstatus: false,
	});
});

app.get("/login", (req, res) => {
	res.render("login", {
		loginerror: false,
		adminstatus: false,
		signupstatus: false,
		authorisationerror : false
	});
});

app.get("/adminlogin", (req, res) => {
	res.render("adminlogin", { loginerror: false, adminstatus: false ,authorisationerror : false});
});

app.post("/signup", async (req, res) => {
	const { name, email, mobile, address, password } = req.body;
	const checkemail = await userdatamodel.findOne({ email: email });
	const checkmobile = await userdatamodel.findOne({ mobile: mobile });

	if (checkemail) {
		return res.render("signup", {emailexists: true,mobileexists: false,adminstatus: false});
	}

	if (checkmobile) {
		return res.render("signup", {emailexists: false,mobileexists: true,adminstatus: false});
	}

	const hashedpwd = await bcryptjs.hash(password, 12);
	const newuser = new userdatamodel({name: name,email: email,mobile: mobile,address: address,password: hashedpwd});
	await newuser.save();
	res.render("login", {signupstatus: true,loginerror: false,adminstatus: false,authorisationerror : false});
});


function verifyToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).render("login", {signupstatus: false,loginerror: false,adminstatus: false,authorisationerror : true});
    }
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).render("login", {signupstatus: false,loginerror: false,adminstatus: false,authorisationerror : true});
        }
        req.user = decoded;
        next();
    });
}

function verifyadminToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).render("adminlogin", {signupstatus: false,loginerror: false,adminstatus: false,authorisationerror : true});
    }
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).render("adminlogin", {signupstatus: false,loginerror: false,adminstatus: false,authorisationerror : true});
        }
        req.user = decoded;
        next();
    });
}


app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await userdatamodel.findOne({ email: email });
    if (!user) {
        return res.render("login", {signupstatus: false,loginerror: true,adminstatus: false,authorisationerror : false});
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
        return res.render("login", {signupstatus: false,loginerror: true,adminstatus: false,authorisationerror : false});
    }
    req.session.email = email;
    req.session.status = true;

    const token = jwt.sign({ email: email }, secretKey, { expiresIn: '1h' });
	res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
    return res.redirect('/');
});


app.get("/editprofile",verifyToken, async (req, res) => {
	let email = req.session.email;
	const userdetails = await userdatamodel.findOne({ email });
	res.render("editprofile", {loginstatus: req.session.status,adminstatus: false,userdetails: userdetails,emailexist: false,mobileexist: false});
});

app.post("/updateprofile", verifyToken,async (req, res) => {
	const { newname, newmobile, newaddress } = req.body;
	let email = req.session.email;
	let existingUser = await userdatamodel.findOne({ email });
	let checkingmobile = await userdatamodel.findOne({ mobile: newmobile });

	if (existingUser) {
		existingUser.name = newname;
		existingUser.mobile = newmobile;
		existingUser.address = newaddress;
		await existingUser.save();
	}
	const userdetails = await userdatamodel.findOne({ email });

	res.render("editprofile", {loginstatus: req.session.status,adminstatus: false,userdetails: userdetails,mobileexist: false,updatedstatus: true});
});

app.get("/vegetables", async (req, res) => {
	const email = req.session.email;
	const vegetables = await vegetablesmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'vegetables';
		res.render("vegetables", {vegetables: vegetables,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true,itemdata : null});
	}else{
		res.render("vegetables", {vegetables: vegetables,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false,itemdata : null});
	}
});

app.get("/flours", async (req, res) => {
	const email = req.session.email;
	const flours = await floursmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'flours';
		res.render("flours", {flours: flours,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("flours", {flours: flours,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get('/dal-lentils-legumes',async(req,res)=>{
	const email = req.session.email;
	const dals = await dalsmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'dals';
		res.render("dals", {dals: dals,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("dals", {dals: dals,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get('/spices',async(req,res)=>{
	const email = req.session.email;
	const spices = await spicesmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'spices';
		res.render("spices", {spices: spices,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("spices", {spices: spices,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get('/milk-nondiary',async(req,res)=>{
	const email = req.session.email;
	const milk = await milkmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'milk';
		res.render("milk", {milk: milk,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("milk", {milk: milk,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get('/sauces-masala-paste',async(req,res)=>{
	const email = req.session.email;
	const sauces = await saucesmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'sauces';
		res.render("sauces", {sauces: sauces,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("sauces", {sauces: sauces,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get("/rice", async (req, res) => {
	const email = req.session.email;
	const rice = await ricemodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'rice';
		res.render("rice", {rice: rice,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("rice", {rice: rice,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get('/pasta-noodles-snack',async(req,res)=>{
	const email = req.session.email;
	const snacks = await snacksmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'snacks';
		res.render("snacks", {snacks: snacks,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("snacks", {snacks: snacks,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get("/coffee", async (req, res) => {
	const email = req.session.email;
	const coffee = await coffeemodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'vegetables';
		res.render("coffee", {coffee: coffee,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("coffee", {coffee: coffee,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get("/oil", async (req, res) => {
	const email = req.session.email;
	const oil = await oilmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'oil';
		res.render("oil", {oil: oil,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("oil", {oil: oil,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get("/cleaning-supplies", async (req, res) => {
	const email = req.session.email;
	const cleaners = await cleaningmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'vegetables';
		res.render("cleaners", {cleaners: cleaners,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("cleaners", {cleaners: cleaners,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get("/personalhygiene", async (req, res) => {
	const email = req.session.email;
	const hygienes = await hygienemodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'hygienes';
		res.render("hygienes", {hygienes: hygienes,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("hygienes", {hygienes: hygienes,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get("/toiletaries", async (req, res) => {
	const email = req.session.email;
	const toiletaries = await toiletariesmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'toiletaries';
		res.render("toiletaries", {toiletaries: toiletaries,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("toiletaries", {toiletaries: toiletaries,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get("/disposables", async (req, res) => {
	const email = req.session.email;
	const disposables = await disposablesmodel.find();
	const alertMessage = req.session.alertMessage;
	req.session.alertMessage = null;
	if(email === 'admin@gmail.com'){
		req.session.itemtype = 'disposables';
		res.render("disposables", {disposables: disposables,loginstatus: req.session.status,adminstatus: true,alertMessage: alertMessage,adminloginstatus : true});
	}else{
		res.render("disposables", {disposables: disposables,loginstatus: req.session.status,adminstatus: false,alertMessage: alertMessage,adminloginstatus : false});
	}
});

app.get("/additem",verifyToken, (req, res) => {
	res.render("additem");
});
app.post("/add-to-cart", verifyToken,async (req, res) => {
	const { id, quantity, price, name } = req.body;
	const useremail = req.session.email;

	if (req.session.status) {
		try {
			await cartmodel.create({
				email: useremail,
				itemid: id,
				itemname: name,
				itemquantity: quantity,
				itemquantitylevel: 1,
				itemprice: price,
			});
			req.session.alertMessage = "Item added to cart";
		} catch (error) {
			console.error("Error adding item to cart:", error);
			res
				.status(500)
				.send("An error occurred while adding the item to the cart.");
			return;
		}
	} else {
		return res.render("login", {
			signupstatus: false,
			loginerror: false,
			adminstatus: false,
		});
	}
	const refererUrl = req.headers.referer;
	res.redirect(refererUrl);
});

app.get("/mycart",verifyToken , async (req, res) => {
	const useremail = req.session.email;
	const cartdata = await cartmodel.find({ email: useremail });
	res.render("mycart", {
		loginstatus: req.session.status,
		adminstatus: false,
		cartdata: cartdata,
	});
});

app.post('/checkout',verifyToken, async (req, res) => {
    const email = req.session.email;
    const { itemname, itemquantitylevel, itemprice } = req.body;
    const orderId = generateOrderId();

    const cartdata = await cartmodel.find({ email: email });

    const itemTotal = [];
    for (let i = 0; i < itemquantitylevel.length; i++) {
		const quantityLevel = parseFloat(itemquantitylevel[i]);
		let price;
	
		if (Array.isArray(itemprice)) {
			price = parseFloat(itemprice[i]);
		} else {
			price = parseFloat(itemprice);
		}
		const total = quantityLevel * price;
		itemTotal.push(total);
	}

    const savedOrders = []; 

    for (let i = 0; i < cartdata.length; i++) {
        const item = cartdata[i];
		console.log(itemTotal);
        const totalCost = itemTotal.length === 1 ? itemTotal[0] : itemTotal[i];
		console.log(itemTotal);

        const order = new orders({
			email: email,
			itemName: cartdata.length === 1 ? itemname : itemname[i],
			itemQuantityLevel: cartdata.length === 1 ? itemquantitylevel : itemquantitylevel[i],
			itemPrice: cartdata.length === 1 ? itemprice : itemprice[i],
			totalCost: totalCost,
			orderId: orderId  
        });
        await order.save();
        savedOrders.push(order._id); 
    }
    
    const userOrderHistory = new userOrderHistoryModel({
        email: email,
        orders: savedOrders,
        orderId: orderId 
    });
    await userOrderHistory.save();

    const orderbill = await orders.find({ email: email, orderId: orderId });

    let messageBody = 'Your order summary:\n';
    orderbill.forEach(order => {
        messageBody += `${order.itemName}: Quantity - ${order.itemQuantityLevel}, Total Cost - Rs ${order.totalCost}\n`;
    });
    const billAmount = calculateTotal(orderbill); 
    messageBody += `\nTotal bill amount: Rs ${billAmount}. Thank you for shopping with us!`;

    const userdata = await userdatamodel.findOne({ email: email });
    let mobile = '+91';
    mobile += userdata.mobile;

  

    await cartmodel.deleteMany({ email: email });
    res.render("checkout", { loginstatus: req.session.status, adminstatus: false, orderbill: orderbill });
});

function calculateTotal(orderbill) {
    let total = 0;
    orderbill.forEach(order => {
        total += parseFloat(order.totalCost);
    });
    return total.toFixed(2);
}

function generateOrderId() {
    const timestamp = new Date().getTime(); 
    const randomNumber = Math.floor(Math.random() * 10000); 
    const orderId = `ORDER-${timestamp}-${randomNumber}`; 
    return orderId;
}

app.post('/deleteitem',verifyToken,async(req,res)=>{
	const email = req.session.email;
	const {itemid} = req.body;
	await cartmodel.deleteOne({_id : itemid,email : email});
	const cartdata = await cartmodel.find({email : email});
	res.render("mycart", {loginstatus: req.session.status,adminstatus: false,cartdata: cartdata});
});

app.get('/myorders', verifyToken,async (req, res) => {
    try {
        const email = req.session.email;
        const orderHistory = await userOrderHistoryModel.find({ email: email }).populate('orders');

        res.render('myorders', { orderHistory: orderHistory });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post("/adminlogin", async (req, res) => {
	const { email, password } = req.body;
	if (email === "admin@gmail.com" && password === "123") {
		req.session.email = email;
		req.session.status = true;
		const token = jwt.sign({ email: email }, secretKey, { expiresIn: '1h' });
		res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
		res.render("adminpage", { adminstatus: true, loginstatus: false,newitem : false,itemdeleted : false ,itemname : null,itemdata : false,updatedstatus : false});
	} else {
		res.render("adminlogin", { loginerror: true, adminstatus: false });
	}
});

app.post('/additem',verifyadminToken,async(req,res)=>{
	const {name,imageurl,price,quantity} = req.body;
	const itemname = req.session.itemtype;
	const modelname = itemname + 'model';
	if(modelname === 'vegetablesmodel'){
		const newitem = new vegetablesmodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'floursmodel'){
		const newitem = new floursmodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'ricemodel'){
		const newitem = new ricemodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'coffeemodel'){
		const newitem = new coffeemodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'cleaningmodel'){
		const newitem = new cleaningmodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'oilmodel'){
		const newitem = new oilmodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'hygienemodel'){
		const newitem = new hygienemodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'toiletariesmodel'){
		const newitem = new toiletariesmodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}else if(modelname === 'disposablesmodel'){
		const newitem = new disposablesmodel({name : name,price : price,quantity : quantity,imageUrl : imageurl});
		await newitem.save();
	}
	res.render("adminpage", { adminstatus: true, loginstatus: false ,newitem : true ,itemdeleted : false ,itemname : null,updatedstatus : false});
});

app.post('/delete-item',verifyadminToken,async(req,res)=>{
	const {itemid,itemcategory} = req.body;
	const Model = mongoose.model(itemcategory);
	const itemData = await Model.findOne({_id : itemid});
	const email = req.session.email;
	if(email === 'admin@gmail.com'){
		const deletedItem = await Model.findByIdAndDelete(itemid);
		if (!deletedItem) {
			return res.status(404).json({ message: "Item not found" });
		}
		res.render("adminpage", { adminstatus: true, loginstatus: false ,newitem : false,itemdeleted : true , itemname : itemData.itemname , itemdata : itemData,updatedstatus : false});
	}
});

app.get("/logout", verifyToken,(req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error("Error destroying session:", err);
		}
		res.redirect("/");
	});
});
app.get("/quote", (req, res) => {
	res.render("quote.ejs");
});
app.listen(3000, () => {
	console.log("Server running at port 3000");
});

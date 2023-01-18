const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Mongoose connection with local server
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://pratik:test123@cluster0.am5xmqs.mongodb.net/todoListDB", { useNewUrlParser: true });

// creating schema
const itemsSchema = {
    name: String,
};

const Item = mongoose.model('item', itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
})

const item3 = new Item({
    name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

// New Schema
const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("list", listSchema);

app.get("/", function (req, res) {

    // let day = date.getDate();   //date.js custome module
    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Succesfully saved default items to DB.");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    })
})

app.get("/:customeListName", function (req, res) {
    const customeListName = _.capitalize(req.params.customeListName);

    List.findOne({ name: customeListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //not found
                const list = new List({
                    name: customeListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customeListName);
            }
            else {
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
    })

});

app.post("/work", function (req, res) {
    workList.push(req.body.newItem);
    res.redirect("/work");
})

app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function (req, res) {
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemID, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemID } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }



});


app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3300, function () {
    console.log("LIstening at port number 3300.");
});
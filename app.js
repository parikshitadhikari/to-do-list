const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
// const date = require(__dirname + "/date.js")
const _ = require("lodash");

const app = express()

// const items = ["Buy Food", "Cook Food", "Eat Food"]
const workItems   = [];

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-parikshit:atlas123@cluster0.kwtvd8m.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema); 

const item1=new Item({name:"Welcome to todolist"});
const item2=new Item({name:"Hit + to add new item"});
const item3=new Item({name:"<--Hit this to delete an item"});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get('/', function(req, res){

    /*let today = new Date()

    let options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }
    let day = today.toLocaleDateString("en-US", options);*/
    // const day = date.getDate()
    // res.render('list', { listTitle: day , newlistItems: items})
    
    Item.find({},function(err, foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("success");
                }
            })
            res.redirect("/");
        }else{
        res.render('list', { listTitle: "Today" , newListItems: foundItems})
        // console.log(foundItems);
        }
    })
    
})

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:customListName}, function(err,foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name:customListName,
                    items:defaultItems
                })
            list.save();
            res.redirect("/"+customListName);
            }else{
                res.render("list", {listTitle:foundList.name, newListItems:foundList.items});
            }
        }
    })
})

app.post('/', function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function (err,foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
    // if(req.body.list === "Work"){
    //     workItems.push(item)
    //     res.redirect("/work")
    // }else{
    //     items.push(item)
    //     res.redirect("/")
    // }

    // console.log(req.body.list);

    /*

    items.push(item)

    console.log(items);

    res.redirect("/")*/
})

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
        if(!err){
            console.log("successfully deleted item");
            res.redirect("/");
        }
    })
}else{
    List.findOneAndUpdate({name: listName},
        {$pull: {items: {_id: checkedItemId}}},
        function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        })
}
})
//     Item.deleteOne({_id : checkedItemId}, function (err) {
//         if (!err) {
//           console.log("Success");
//           res.redirect("/");
//         }
//     })
// })

app.get("/work", function(req, res){
    res.render("list", { listTitle: "Work List", newlistItems: workItems})
})

app.post("/work", function(req, res){
    const item = req.body.newItem;
    workItems
})

app.listen(process.env.PORT || 3000);

var express = require('express');
var router = express.Router();
const Note = require('../models/note'); 
const withAuth = require('../middlewares/auth')

//Create
router.post('/', withAuth, async( req, res )=>{
    const { title, body } = req.body;
    let note = new Note ({ title:title, body:body, author: req.user._id})
    
    try{
      
      await note.save();
        res.status(200).json(note);
    } catch (error){
        res.status(500).json({error: 'Problem to create a new note.'})
    }
})
//Buscando nota
router.get('/search', withAuth, async( req, res ) =>{
  const { query } = req.query;
  try{
      let notes = await Note
      .find({ author: req.user._id})
      .find({ $text: {$search: query }});
      res.json(notes);
  }catch (error){
    console.log(error)
    res.json({error: error}).status(500);
  }
})
// Trazendo nota
router.get('/:id', withAuth, async( req, res ) =>{
  try {
    const { id } = req.params;
    let note = await Note.findById(id);
    if(is_owner(req.user, note))
      res.json(note);
    else
      res.status(403).json({error:'permission denied.'})
  } catch (error) {
    res.send(error).status(500)
  }
});
// tTrazendo lista denotas 
router.get('/', withAuth, async( req, res ) =>{
  try{
    let notes = await Note.find({author: req.user._id});
    res.json(notes);
  }
  catch (error){
    res.json({error: error}).status(500);
  }
})
//Atualizando notas
 router.put('/:id', withAuth, async( req, res ) =>{
    const { title, body } = req.body;
    const { id } =  req.params;

    try {
      let note = await Note.findById(id);
      if (is_owner(req.user, note)){
        let note = await Note.findByIdAndUpdate(id,
          {$set: {title, body: body }},
          {upsert:true, 'new': true}
          );

          res.json(note);
      }else
        res.status(500).json({error:'problem to update a note.'})
      
    }
    catch{
      res.status(500).json({error:'problem to update a note.'});
    }

 })
//Deletando notas
router.delete('/:id', withAuth, async( req, res ) =>{
  const { id } =  req.params;

  try {
    let note = await Note.findById(id);
    if (is_owner(req.user, note)){
      let note = await Note.findByIdAndUpdate(id);
        res.json({message:'Success DELETE a note.'}).status(204);
    }else
      res.status(403).json({error:'Permission DENIED.'})
  }
  catch (error) {
    res.status(500).json({error:'problem to DELETE a note.'});
  }

})


//verifica se é author da nota.
const is_owner = (user, note) => {
  if(JSON.stringify(user._id) == JSON.stringify(note.author._id))
    return true;
  else
    return false;
}


module.exports = router;
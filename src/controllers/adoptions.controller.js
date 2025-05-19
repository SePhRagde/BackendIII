import { adoptionsService, petsService, usersService } from "../services/index.js"

const getAllAdoptions = async(req,res)=>{
    try {
        if (req.user.role === 'admin') {
            const result = await adoptionsService.getAll();
            console.log('Admin getAllAdoptions result:', result);
            return res.send({status:"success",payload:Array.isArray(result) ? result : []})
        } else {
            const result = await adoptionsService.get({ owner: req.user.id });
            console.log('User getAllAdoptions result:', result);
            return res.send({status:"success",payload:Array.isArray(result) ? result : []})
        }
    } catch (error) {
        console.error('getAllAdoptions error:', error);
        res.status(500).send({status:"error", error: error.message});
    }
}

const getAdoption = async(req,res)=>{
    const adoptionId = req.params.aid;
    const adoption = await adoptionsService.getBy({_id:adoptionId})
    if(!adoption) return res.status(404).send({status:"error",error:"Adoption not found"})
    res.send({status:"success",payload:adoption})
}

const createAdoption = async(req,res)=>{
    const {uid,pid} = req.params;
    const pet = await petsService.getBy({_id:pid});
    if(!pet) return res.status(404).send({status:"error",error:"Pet not found"});
    const user = await usersService.getUserById(uid);
    if(!user) return res.status(404).send({status:"error", error:"user Not found"});
    if(pet.adopted) return res.status(400).send({status:"error",error:"Pet is already adopted"});
    user.pets.push(pet._id);
    await usersService.update(user._id,{pets:user.pets})
    await petsService.update(pet._id,{adopted:true,owner:user._id})
    await adoptionsService.create({owner:user._id,pet:pet._id})
    res.send({status:"success",message:"Pet adopted"})
}

const updateAdoptionStatus = async (req, res) => {
    const adoptionId = req.params.aid;
    const { status } = req.body;
    if (req.user.role !== 'admin') {
        return res.status(403).send({ status: 'error', message: 'Not authorized' });
    }
    const adoption = await adoptionsService.getBy({ _id: adoptionId });
    if (!adoption) {
        return res.status(404).send({ status: 'error', message: 'Adoption not found' });
    }
    await adoptionsService.update(adoptionId, { status });
    res.send({ status: 'success', message: 'Adoption status updated' });
};

export default {
    createAdoption,
    getAllAdoptions,
    getAdoption,
    updateAdoptionStatus
}
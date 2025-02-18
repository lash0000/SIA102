const { UploadFiles, CreateFolder, DeleteFiles } = require("../../../../../global/utils/Drive");
const HotelMediaFiles = require("./model");

const CreateFiles = async (req, res) => {
    try {
        const id = req.query.id
        const { body, files } = req
        const DOCUMENT_MAX_SIZE = 104857600; // 100 MB limit.
        const data = JSON.parse(body.obj)
        let group_files = []

        if (files.length != 0) {
            let err = [];

            for (const file of files) {
                if (file.size > DOCUMENT_MAX_SIZE) {
                    err.push({ error: `File ${file.originalname} exceeds ${DOCUMENT_MAX_SIZE / 1024 / 1024}MB limit.` })
                    console.log(err)
                }
            }

            if (err.length != 0)
                return res.status(400).json(err);
        }

        const doc_id = new mongoose.Types.ObjectId()
        const folder_id = await CreateFolder(doc_id, process.env.EMPLOYEE_FOLDER_ID);

        for (const file of files) {
            const { id, name } = await UploadFiles(file, folder_id);

            group_files.push({
                link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
                id,
                name
            })
        }

        // Just make this part to ensure that 
        const result = await HotelMediaFiles.create({ ...data, })

        res.status(201).json({ message: 'Data created', result });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    CreateFiles
};

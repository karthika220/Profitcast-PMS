const prisma = require('../config/prisma');

const getSettings = async (req, res) => {
  try {
    const settings = await prisma.settings.findMany({ orderBy: { key: 'asc' } });
    const settingsMap = {};
    settings.forEach((s) => { settingsMap[s.key] = s.value; });
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    const setting = await prisma.settings.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });

    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSetting };

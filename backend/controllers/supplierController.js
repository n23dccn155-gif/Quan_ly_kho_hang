const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all active suppliers for selection lists
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' }
    });
    
    // Convert Decimals to Numbers for JSON
    const serialized = suppliers.map(s => ({
      ...s,
      distance_km: s.distance_km ? Number(s.distance_km) : null
    }));

    return res.json(serialized);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống khi tải danh sách nhà cung cấp.' });
  }
};

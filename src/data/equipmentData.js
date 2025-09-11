// Equipment data extracted from Clover product images
export const equipmentData = [
  {
    id: 'clover-mini',
    name: 'Clover Mini',
    image: 'images/clover-mini.png',
    description: 'Compact countertop payment terminal',
    category: 'countertop',
    options: [
      {
        type: 'rental',
        price: 13.00,
        period: 'month',
        duration: 48,
        description: 'MMSLLL48Month-48 Month Rental',
        totalCost: 624.00
      },
      {
        type: 'step_up',
        price: 1.00,
        period: 'month',
        stepUpPrice: 30.00,
        duration: 48,
        description: 'Clover 48 Month-Step Up 6 Month',
        totalCost: 78.00 // 1.00 x 48 + step up costs
      }
    ],
    addOns: []
  },
  {
    id: 'clover-cash-drawer',
    name: 'Clover Cash Drawer',
    image: 'images/clover-cash-drawer.png',
    description: 'Secure cash storage solution',
    category: 'accessory',
    options: [
      {
        type: 'purchase',
        price: 40.00,
        period: 'upfront',
        description: 'MMSLP01Month-Purchase',
        totalCost: 40.00
      }
    ],
    addOns: []
  },
  {
    id: 'clover-kitchen-printer',
    name: 'Clover Kitchen Printer',
    image: 'images/clover-kitchen-printer.png',
    description: 'Kitchen receipt printer for restaurants',
    category: 'printer',
    options: [
      {
        type: 'purchase',
        price: 252.99,
        period: 'upfront',
        description: 'MMSLP01Month-Purchase',
        totalCost: 252.99
      }
    ],
    addOns: [],
    features: ['Quantity selector', 'Price adjustment']
  },
  {
    id: 'clover-flex',
    name: 'Clover Flex',
    image: 'images/clover-flex.png',
    description: 'Portable handheld payment device',
    category: 'portable',
    options: [
      {
        type: 'rental',
        price: 13.00,
        period: 'month',
        duration: 48,
        description: 'MMSLLL48Month-48 Month Rental',
        totalCost: 624.00
      },
      {
        type: 'step_up',
        price: 1.00,
        period: 'month',
        stepUpPrice: 30.00,
        duration: 48,
        description: 'Clover 48 Month-Step Up 6 Month',
        totalCost: 78.00
      }
    ],
    addOns: [
      {
        id: 'amex',
        name: 'Clover American Express',
        included: false
      },
      {
        id: 'moto',
        name: 'Clover MOTO',
        included: false
      },
      {
        id: 'cashback',
        name: 'Purchase with Cashback',
        included: false
      }
    ]
  },
  {
    id: 'clover-station-duo',
    name: 'Clover Station Duo',
    image: 'images/clover-station-duo.png',
    description: 'Dual-screen POS system for full-service businesses',
    category: 'pos_system',
    options: [
      {
        type: 'rental',
        price: 30.00,
        period: 'month',
        duration: 48,
        description: 'MMSLLL48Month-48 Month Rental',
        totalCost: 1440.00
      },
      {
        type: 'step_up',
        price: 1.00,
        period: 'month',
        stepUpPrice: 50.00,
        duration: 48,
        description: 'Clover 48 Month-Step Up 6 Month',
        totalCost: 348.00
      }
    ],
    addOns: []
  }
]

// Equipment categories for filtering
export const equipmentCategories = [
  { id: 'all', name: 'All Equipment' },
  { id: 'countertop', name: 'Countertop Terminals' },
  { id: 'portable', name: 'Portable Devices' },
  { id: 'pos_system', name: 'POS Systems' },
  { id: 'printer', name: 'Printers' },
  { id: 'accessory', name: 'Accessories' }
]

// Add-on services
export const availableAddOns = [
  {
    id: 'moto',
    name: 'MOTO (Mail Order/Telephone Order)',
    description: 'Accept payments over phone or mail',
    price: 0, // Usually included or setup fee
    monthly: false
  },
  {
    id: 'cashback',
    name: 'Cashback Service',
    description: 'Allow customers to get cash back with purchases',
    price: 0, // Usually included
    monthly: false
  },
  {
    id: 'amex',
    name: 'American Express',
    description: 'Accept American Express cards',
    price: 0, // Usually higher processing fees
    monthly: false
  }
]

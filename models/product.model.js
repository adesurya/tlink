const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    discountPrice: {
      type: Number,
      default: 0
    },
    commission: {
      type: Number,
      default: 0
    },
    commissionSources: [{
      name: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      rate: {
        type: Number,
        required: true
      },
      icon: {
        type: String,
        default: 'fa-gift'
      }
    }],
    totalCommission: {
      type: Number,
      default: 0
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    image: {
      type: String,
      required: true
    },
    images: [{
      type: String
    }],
    bonusInfo: [{
      title: {
        type: String,
        required: true
      },
      description: {
        type: String
      },
      image: {
        type: String
      }
    }],
    specifications: [{
      label: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      }
    }],
    howToUse: [{
      type: String
    }],
    affiliateLink: {
      type: String,
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    isViral: {
      type: Boolean,
      default: false
    },
    isHot: {
      type: Boolean,
      default: false
    },
    isTopRated: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    tags: [{
      type: String
    }],  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  viewCount: {
    type: Number,
    default: 0
  }
});

// Update the updatedAt timestamp on save
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted price
ProductSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.discountPrice && this.price > this.discountPrice) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

module.exports = mongoose.model('Product', ProductSchema);
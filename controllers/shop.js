const { validationResult } = require('express-validator/check');
const Product = require('../models/product');
const User = require('../models/user');

exports.getProducts = (req, res, next) => {
  console.log(req.userId);
  User.findByPk(req.userId)
    .then(user => {
      if(user.role === 'admin'){
        Product.findAll()
        .then(products => {
          res.status(200).json({
            products: products
          });
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
      }
      user.getProducts().then(products => {
        res.status(200).json({
          products: products
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
    }).catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  return Product.findByPk(prodId)
    .then(product => {
      res.status(200).json({
        message: 'Product with product id:' +prodId+' fetched successfully!',
        product: product
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postAddProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  User.findByPk(req.userId).then(
    user => {
      user.createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description
    })
    .then(result => {
      res.status(200).json({
        message: 'Product Created!'
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
    }
  ).catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then(product => {
      if(!product){
        const error = new Error('Product not found!');
        error.statusCode = 404;
        throw error;
      }
      if (req.userId !== product.userId) {
        const error = new Error('Unauthorized to delete this product..');
        error.statusCode = 403;
        throw error;
      }
      return product.destroy();
    })
    .then(result => {
      res.status(200).json({
        message: 'Product deleted successfully!'
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getCart = (req, res, next) => {
  User.findByPk(req.userId)
    .then(user => {
      user.getCart().then(cart => {
        cart.getProducts()
          .then(products => {
            res.status(200).json({
              products: products
            });
          })
          .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    }).catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  User.findByPk(req.userId).then(user => {
    user
      .getCart()
      .then(cart => {
        fetchedCart = cart;
        return cart.getProducts({ where: { id: prodId } });
      })
      .then(products => {
        console.log(products);
        let product;
        if (products.length > 0) {
          product = products[0];
        }

        if (product) {
          const oldQuantity = product.cartItem.quantity;
          newQuantity = oldQuantity + 1;
          return product;
        }
        return Product.findByPk(prodId);
      })
      .then(product => {
        return fetchedCart.addProduct(product, {
          through: { quantity: newQuantity }
        });
      })
      .then(() => {
        res.status(200).json({
          message: 'Cart updated successfully!'
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  }).catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  User.findByPk(req.userId).then(
    user => {
      user
        .getCart()
        .then(cart => {
          return cart.getProducts({ where: { id: prodId } });
        })
        .then(products => {
          const product = products[0];
          return product.cartItem.destroy();
        })
        .then(result => {
          res.status(200).json({
            message: 'Cart item deleted successfully!'
          });
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    }
  ).catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  User.findByPk(req.userId)
  .then( user => {
    user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return user
        .createOrder()
        .then(order => {
          return order.addProducts(
            products.map(product => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .then(result => {
      return fetchedCart.setProducts(null);
    })
    .then(result => {
      res.status(200).json({
        message: 'Order created successfully!'
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

exports.getOrders = (req, res, next) => {
  User.findByPk(req.userId)
  .then( user => {
    user
    .getOrders({include: ['products']})
    .then(orders => {
      res.status(200).json({
        orders: orders
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  })
  .catch(
    err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  );
};
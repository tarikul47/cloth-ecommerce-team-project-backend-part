module.exports = {
  routes: [
    {
      method: "GET",
      path: "/products/:_id/build",
      handler: "product.build",
    },
  ],
};

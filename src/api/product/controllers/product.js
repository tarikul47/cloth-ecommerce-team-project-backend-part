"use strict";

/**
 * product controller function
 */
const { createCoreController } = require("@strapi/strapi").factories;

// loadsh include
var _ = require("lodash");

module.exports = createCoreController("api::product.product", ({ strapi }) => ({
  async build(ctx) {
    // param get
    const { _id } = ctx.params;

    // product find by param [_id]
    let product = await strapi.db.query("api::product.product").findOne({
      where: {
        id: Number(_id),
      },
    });

    // if attributes filed emppty then it's return
    if (!product.attributes.length) return;

    // combination functions
    const cartesian = (sets) => {
      return sets.reduce(
        (acc, curr) => {
          return acc
            .map((x) => {
              return curr.map((y) => {
                return x.concat([y]);
              });
            })
            .flat();
        },
        [[]]
      );
    };

    //capitalize function
    const capitalize = (s) => {
      if (typeof s !== "string") return "";
      return s
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    // attributes find by product
    const { attributes } = product;

    const variations = cartesian(
      _.map(attributes, ({ name, options }) =>
        _.map(options, ({ value, description }) => ({
          [name]: value,
          description,
        }))
      )
    );

    //iterate through all variations creating the records
    const records = _.map(variations, (variation) => {
      let name = variation.reduce(
        (acc, current) => acc + " " + Object.values(current)[0],
        product.name
      );

      let description = variation.reduce(
        (acc, current) => acc + " " + Object.values(current)[1],
        ""
      );

      let slug = variation
        .reduce(
          (acc, current) =>
            acc + "-" + Object.values(current)[0].replace(/ /g, "-"),
          product.slug
        )
        .toLowerCase();

      return {
        //  variation: variation,
        product: product.id,
        name: capitalize(name),
        slug: slug,
        size: "",
        color: "",
        price: product.price,
        description: description,
        stock: product.stock,
        ...("sale" in product && { sale: product.sale }),
      };
    });

    try {
      const createAllRecords = await Promise.all(
        records.map(
          (record) =>
            new Promise(async (resolve, reject) => {
              try {
                const created = await strapi.entityService.create(
                  "api::variation.variation",
                  {
                    data: record,
                  }
                );
                resolve(created);
              } catch (err) {
                reject(err);
              }
            })
        )
      );

      // response send
      ctx.send(createAllRecords);
      // ctx.send(variations);
    } catch (err) {
      console.error(err);
    }

    // ctx.send(records);
    //ctx.body = records
  },
})); // controler end ;

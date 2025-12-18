const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
  // Passthrough copy for assets
  eleventyConfig.addPassthroughCopy("src/assets");
  
  // Date formatting filters
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("LLLL d, yyyy");
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // Get the first `n` elements of a collection
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }
    return array.slice(0, n);
  });

  // Filter by category
  eleventyConfig.addFilter("filterByCategory", (posts, category) => {
    return posts.filter(post => post.data.category === category);
  });

  // Collections
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").sort((a, b) => {
      return b.date - a.date;
    });
  });

  eleventyConfig.addCollection("focusguard", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").filter(post => {
      return post.data.category === "focusguard";
    });
  });

  eleventyConfig.addCollection("snapp", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").filter(post => {
      return post.data.category === "snapp";
    });
  });

  eleventyConfig.addCollection("endurotrack", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").filter(post => {
      return post.data.category === "endurotrack";
    });
  });

  return {
    dir: {
      input: "src",
      output: "../blog",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};



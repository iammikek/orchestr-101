class ApiSerializer {
  static category(category) {
    return {
      id: Number(category.id),
      name: category.name,
      description: category.description,
    };
  }

  static item(item, category = null, includeCategory = true) {
    const data = {
      id: Number(item.id),
      name: item.name,
      description: item.description,
      price: Number(item.price),
      category_id: item.category_id != null ? Number(item.category_id) : null,
    };

    if (includeCategory && category != null) {
      data.category = this.category(category);
    } else {
      data.category = null;
    }

    return data;
  }

  static user(user) {
    return {
      id: Number(user.id),
      email: user.email,
    };
  }
}

module.exports = { ApiSerializer };

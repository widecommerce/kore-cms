﻿using System;
using System.Collections.Generic;
using System.Linq;
using Kore.Collections;
using Kore.Data;
using Kore.Plugins.Ecommerce.Simple.Data.Domain;
using Kore.Web.ContentManagement.Areas.Admin.Menus.Domain;
using Kore.Web.ContentManagement.Infrastructure;

namespace Kore.Plugins.Ecommerce.Simple.Infrastructure
{
    public class AutoMenuProvider : IAutoMenuProvider
    {
        private readonly Lazy<IRepository<Category>> categoryRepository;
        private readonly Lazy<IRepository<Product>> productRepository;
        private readonly StoreSettings storeSettings;

        public AutoMenuProvider(
            Lazy<IRepository<Category>> categoryRepository,
            Lazy<IRepository<Product>> productRepository,
            StoreSettings storeSettings)
        {
            this.categoryRepository = categoryRepository;
            this.productRepository = productRepository;
            this.storeSettings = storeSettings;
        }

        #region IAutoMenuProvider Members

        public string RootUrlSlug
        {
            get { return "store"; }
        }

        public MenuItem GetRootMenuItem()
        {
            if (!storeSettings.ShowOnMenus)
            {
                return null;
            }

            return new MenuItem
            {
                Text = storeSettings.PageTitle,
                Url = "/store",
                Enabled = true,
                ParentId = null,
                Position = storeSettings.MenuPosition
            };
        }

        public IEnumerable<MenuItem> GetSubMenuItems(string currentUrlSlug)
        {
            if (!storeSettings.ShowOnMenus)
            {
                return Enumerable.Empty<MenuItem>();
            }

            if (!currentUrlSlug.StartsWithAny(RootUrlSlug, "categories"))
            {
                return Enumerable.Empty<MenuItem>();
            }

            //string[] split = currentUrlSlug.Split(new[] { "/" }, StringSplitOptions.RemoveEmptyEntries);

            if (currentUrlSlug == "store" || currentUrlSlug == "store/categories")
            {
                var menuItems = categoryRepository.Value.Table
                    .Where(x => x.ParentId == null)
                    .OrderBy(x => x.Name)
                    .ToHashSet()
                    .Select((x, index) => new MenuItem
                    {
                        Text = x.Name,
                        Url = "/store/categories/" + x.Slug,
                        Enabled = true,
                        ParentId = null,
                        Position = index
                    });
                return menuItems;
            }
            else
            {
                string categorySlug = currentUrlSlug
                    .Replace("store/", string.Empty)
                    .Replace("categories/", string.Empty);

                var category = categoryRepository.Value.Table.FirstOrDefault(x => x.Slug == categorySlug);

                if (category == null)
                {
                    return Enumerable.Empty<MenuItem>();
                }

                var menuItems = categoryRepository.Value.Table
                    .Where(x => x.ParentId == category.Id)
                    .OrderBy(x => x.Name)
                    .ToHashSet()
                    .Select((x, index) => new MenuItem
                    {
                        Text = x.Name,
                        Url = "/store/categories/" + x.Slug,
                        Enabled = true,
                        ParentId = null,
                        Position = index
                    });
                return menuItems;
            }
        }

        #endregion IAutoMenuProvider Members
    }
}
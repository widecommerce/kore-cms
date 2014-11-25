﻿using System;
using System.Collections.Generic;
using System.Linq;
using Kore.Collections;
using Kore.Data;
using Kore.Infrastructure;
using Kore.Web.ContentManagement.Areas.Admin.Pages;
using Kore.Web.ContentManagement.Areas.Admin.Pages.Domain;

namespace Kore.Web.ContentManagement
{
    public class StartupTask : IStartupTask
    {
        #region IStartupTask Members

        public void Execute()
        {
            var typeFinder = EngineContext.Current.Resolve<ITypeFinder>();
            var pageTypeRepository = EngineContext.Current.Resolve<IRepository<PageType>>();

            var allPageTypes = typeFinder.FindClassesOfType<KorePageType>()
                .Select(x => (KorePageType)Activator.CreateInstance(x));

            var allPageTypeNames = allPageTypes.Select(x => x.Name).ToList();
            var installedPageTypes = pageTypeRepository.Table.ToList();
            var installedPageTypeNames = installedPageTypes.Select(x => x.Name).ToList();

            var pageTypesToAdd = allPageTypes.Where(x => !installedPageTypeNames.Contains(x.Name)).Select(x => new PageType
            {
                Id = Guid.NewGuid(),
                Name = x.Name,
                DisplayTemplatePath = x.DisplayTemplatePath,
                EditorTemplatePath = x.EditorTemplatePath,
                Fields = null //TODO
            });

            if (!pageTypesToAdd.IsNullOrEmpty())
            {
                pageTypeRepository.Insert(pageTypesToAdd);
            }

            var pageTypesToDelete = installedPageTypes.Where(x => !allPageTypeNames.Contains(x.Name));

            if (!pageTypesToDelete.IsNullOrEmpty())
            {
                pageTypeRepository.Delete(pageTypesToDelete);
            }
        }

        public int Order
        {
            get { return 1; }
        }

        #endregion IStartupTask Members
    }
}
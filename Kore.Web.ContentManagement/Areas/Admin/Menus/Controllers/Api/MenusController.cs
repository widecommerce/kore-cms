﻿using System;
using System.Web.Http;
using System.Web.Http.Cors;
using Kore.Data;
using Kore.Web.ContentManagement.Areas.Admin.Menus.Domain;
using Kore.Web.Http.OData;

namespace Kore.Web.ContentManagement.Areas.Admin.Menus.Controllers.Api
{
    [Authorize(Roles = KoreConstants.Roles.Administrators)]
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class MenusController : GenericODataController<Menu, Guid>
    {
        public MenusController(IRepository<Menu> repository)
            : base(repository)
        {
        }

        protected override Guid GetId(Menu entity)
        {
            return entity.Id;
        }

        protected override void SetNewId(Menu entity)
        {
            entity.Id = Guid.NewGuid();
        }
    }
}
﻿using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using Kore.Data;
using Kore.Data.EntityFramework;
using Kore.Web.Plugins;

namespace Kore.Plugins.Widgets.FullCalendar.Data.Domain
{
    public class Calendar : IEntity
    {
        private ICollection<CalendarEvent> events;

        public int Id { get; set; }

        public string Name { get; set; }

        public virtual ICollection<CalendarEvent> Events
        {
            get { return events ?? (events = new HashSet<CalendarEvent>()); }
            set { events = value; }
        }

        #region IEntity Members

        public object[] KeyValues
        {
            get { return new object[] { Id }; }
        }

        #endregion IEntity Members
    }

    public class CalendarMap : EntityTypeConfiguration<Calendar>, IEntityTypeConfiguration
    {
        public CalendarMap()
        {
            if (!PluginManager.IsPluginInstalled(Constants.PluginSystemName))
            {
                return;
            }

            ToTable(Constants.Tables.Calendars);
            HasKey(x => x.Id);
            Property(x => x.Name).IsRequired().HasMaxLength(255);
        }
    }
}
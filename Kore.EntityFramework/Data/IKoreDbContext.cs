﻿using System.Data.Entity;
using Kore.Configuration.Domain;
using Kore.Localization.Domain;
using Kore.Tasks.Domain;
using LanguageEntity = Kore.Localization.Domain.Language;

namespace Kore.Data
{
    public interface IKoreDbContext
    {
        DbSet<LanguageEntity> Languages { get; set; }

        DbSet<LocalizableString> LocalizableStrings { get; set; }

        DbSet<ScheduledTask> ScheduledTasks { get; set; }

        DbSet<Setting> Settings { get; set; }
    }
}
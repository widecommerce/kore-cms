﻿'use strict'

var PageTypeVM = function () {
    var self = this;

    self.id = ko.observable(emptyGuid);
    self.name = ko.observable(null);
    self.layoutPath = ko.observable(null);
    self.displayTemplatePath = ko.observable(null);
    self.editorTemplatePath = ko.observable(null);

    self.edit = function (id) {
        $.ajax({
            url: "/odata/kore/cms/PageTypeApi(guid'" + id + "')",
            type: "GET",
            dataType: "json",
            async: false
        })
        .done(function (json) {
            self.id(json.Id);
            self.name(json.Name);
            self.layoutPath(json.LayoutPath);
            self.displayTemplatePath(json.DisplayTemplatePath);
            self.editorTemplatePath(json.EditorTemplatePath);

            self.validator.resetForm();
            switchSection($("#page-type-form-section"));
            $("#page-type-form-section-legend").html(translations.Edit);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $.notify(translations.GetRecordError, "error");
            console.log(textStatus + ': ' + errorThrown);
        });
    };

    self.delete = function (id) {
        if (confirm(translations.DeleteRecordConfirm)) {
            $.ajax({
                url: "/odata/kore/cms/PageTypeApi(guid'" + id + "')",
                type: "DELETE",
                async: false
            })
            .done(function (json) {
                $('#PageTypesGrid').data('kendoGrid').dataSource.read();
                $('#PageTypesGrid').data('kendoGrid').refresh();

                $.notify(translations.DeleteRecordSuccess, "success");
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $.notify(translations.DeleteRecordError, "error");
                console.log(textStatus + ': ' + errorThrown);
            });
        }
    };

    self.save = function () {
        var isNew = (self.id() == emptyGuid);

        if (!$("#page-type-form-section-form").valid()) {
            return false;
        }

        var record = {
            Id: self.id(),
            Name: self.name(),
            LayoutPath: self.layoutPath(),
            DisplayTemplatePath: self.displayTemplatePath(),
            EditorTemplatePath: self.editorTemplatePath()
        };

        if (isNew) {
            $.ajax({
                url: "/odata/kore/cms/PageTypeApi",
                type: "POST",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(record),
                dataType: "json",
                async: false
            })
            .done(function (json) {
                $('#PageTypesGrid').data('kendoGrid').dataSource.read();
                $('#PageTypesGrid').data('kendoGrid').refresh();

                switchSection($("#page-type-grid-section"));

                $.notify(translations.InsertRecordSuccess, "success");
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $.notify(translations.InsertRecordError, "error");
                console.log(textStatus + ': ' + errorThrown);
            });
        }
        else {
            $.ajax({
                url: "/odata/kore/cms/PageTypeApi(guid'" + self.id() + "')",
                type: "PUT",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(record),
                dataType: "json",
                async: false
            })
            .done(function (json) {
                $('#PageTypesGrid').data('kendoGrid').dataSource.read();
                $('#PageTypesGrid').data('kendoGrid').refresh();

                switchSection($("#page-type-grid-section"));

                $.notify(translations.UpdateRecordSuccess, "success");
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $.notify(translations.UpdateRecordError, "error");
                console.log(textStatus + ': ' + errorThrown);
            });
        }
    };

    self.cancel = function () {
        switchSection($("#page-type-grid-section"));
    };

    self.validator = $("#page-type-form-section-form").validate({
        rules: {
            Name: { required: true, maxlength: 255 },
            LayoutPath: { required: true, maxlength: 255 },
            DisplayTemplatePath: { maxlength: 255 },
            EditorTemplatePath: { maxlength: 255 }
        }
    });
};

var PageVersionVM = function () {
    var self = this;

    self.id = ko.observable(emptyGuid);
    self.pageId = ko.observable(emptyGuid);
    self.cultureCode = ko.observable(currentCulture);
    self.status = ko.observable(0);
    self.title = ko.observable(null);
    self.slug = ko.observable(null);
    self.fields = ko.observable(null);

    self.isDraft = ko.observable(true);

    self.pageModelStub = null;

    self.view = function (id) {
        $.ajax({
            url: "/odata/kore/cms/PageVersionApi(guid'" + id + "')",
            type: "GET",
            dataType: "json",
            async: false
        })
        .done(function (json) {
            self.id(json.Id);
            self.pageId(json.PageId);
            self.cultureCode(json.CultureCode);
            self.status(json.Status);
            self.title(json.Title);
            self.slug(json.Slug);
            self.fields(json.Fields);

            $.get("/admin/pages/preview/" + id, function (data) {
                $("#page-preview").contents().find('html').html(data);
            });

            switchSection($("#version-details-section"));
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $.notify(translations.GetRecordError, "error");
            console.log(textStatus + ': ' + errorThrown);
        });
    };

    self.restore = function () {
        if (confirm(translations.PageHistoryRestoreConfirm)) {
            $.ajax({
                url: "/odata/kore/cms/PageVersionApi(guid'" + self.id() + "')/RestoreVersion",
                type: "POST"
            })
            .done(function (json) {
                $('#PageVersionGrid').data('kendoGrid').dataSource.read();
                $('#PageVersionGrid').data('kendoGrid').refresh();
                switchSection($("#version-grid-section"));
                $.notify(translations.PageHistoryRestoreSuccess, "success");
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $.notify(translations.PageHistoryRestoreError, "error");
                console.log(textStatus + ': ' + errorThrown);
            });
        };
    };

    self.cancel = function () {
        $('#page-preview').contents().find('html').html('');
        switchSection($("#version-grid-section"));
    };

    self.goBack = function () {
        switchSection($("#form-section"));
        viewModel.showToolbar(true);
    };

    self.refresh = function () {
        $('#PageVersionGrid').data('kendoGrid').dataSource.read();
        $('#PageVersionGrid').data('kendoGrid').refresh();
        switchSection($("#version-grid-section"));
    };
};

var ViewModel = function () {
    var self = this;

    self.id = ko.observable(emptyGuid);
    self.parentId = ko.observable(null);
    self.pageTypeId = ko.observable(emptyGuid);
    self.title = ko.observable(null);
    self.isEnabled = ko.observable(false);
    self.order = ko.observable(0);
    self.showOnMenus = ko.observable(true);

    self.accessRestrictions = null;
    self.roles = ko.observableArray([]);
    self.showToolbar = ko.observable(false);
    self.isEditMode = ko.observable(false);

    self.pageType = new PageTypeVM();
    self.pageVersion = new PageVersionVM();

    self.create = function () {
        self.id(emptyGuid);
        self.parentId(null);
        self.pageTypeId(emptyGuid);
        self.title(null);
        self.isEnabled(false);
        self.order(0);
        self.showOnMenus(true);
        self.accessRestrictions = null;

        self.roles([]);

        self.setupVersionCreateSection();

        self.showToolbar(false);
        self.isEditMode(false);

        self.validator.resetForm();
        switchSection($("#form-section"));
        $("#form-section-legend").html(translations.Create);
    };

    self.setupVersionCreateSection = function () {
        self.pageVersion.id(emptyGuid);
        self.pageVersion.pageId(emptyGuid);
        self.pageVersion.cultureCode(currentCulture);
        self.pageVersion.status(0);
        self.pageVersion.title(null);
        self.pageVersion.slug(null);
        self.pageVersion.fields(null);

        // Clean up from previously injected html/scripts
        if (self.pageVersion.pageModelStub != null && typeof self.pageVersion.pageModelStub.cleanUp === 'function') {
            self.pageVersion.pageModelStub.cleanUp();
        }
        self.pageVersion.pageModelStub = null;

        // Remove Old Scripts
        var oldScripts = $('script[data-fields-script="true"]');

        if (oldScripts.length > 0) {
            $.each(oldScripts, function () {
                $(this).remove();
            });
        }

        var elementToBind = $("#fields-definition")[0];
        ko.cleanNode(elementToBind);
        $("#fields-definition").html("");

        self.versionValidator.resetForm();
    };

    self.edit = function (id) {
        $.ajax({
            url: "/odata/kore/cms/PageApi(guid'" + id + "')",
            type: "GET",
            dataType: "json",
            async: false
        })
        .done(function (json) {
            self.id(json.Id);
            self.parentId(json.ParentId);
            self.pageTypeId(json.PageTypeId);
            self.title(json.Title);
            self.isEnabled(json.IsEnabled);
            self.order(json.Order);
            self.showOnMenus(json.ShowOnMenus);
            self.accessRestrictions = ko.mapping.fromJSON(json.AccessRestrictions);

            if (self.accessRestrictions.Roles != null) {
                var split = self.accessRestrictions.Roles().split(',');
                self.roles(split);
            }
            else {
                self.roles([]);
            }

            $.ajax({
                url: "/odata/kore/cms/PageVersionApi/GetCurrentVersion",
                type: "POST",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({
                    pageId: self.id(),
                    cultureCode: currentCulture
                }),
                dataType: "json",
                async: false
            })
            .done(function (json) {
                self.setupVersionEditSection(json);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $.notify(translations.GetRecordError, "error");
                console.log(textStatus + ': ' + errorThrown);
            });

            self.showToolbar(true);
            self.isEditMode(true);

            self.validator.resetForm();
            switchSection($("#form-section"));
            $("#form-section-legend").html(translations.Edit);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $.notify(translations.GetRecordError, "error");
            console.log(textStatus + ': ' + errorThrown);
        });
    };

    self.setupVersionEditSection = function (json) {
        self.pageVersion.id(json.Id);
        self.pageVersion.pageId(json.PageId);
        self.pageVersion.cultureCode(json.CultureCode);
        self.pageVersion.status(json.Status);
        self.pageVersion.title(json.Title);
        self.pageVersion.slug(json.Slug);
        self.pageVersion.fields(json.Fields);

        if (json.Status == 'Draft') {
            self.pageVersion.isDraft(true);
        }
        else {
            self.pageVersion.isDraft(false);
        }

        $.ajax({
            url: "/admin/pages/get-editor-ui/" + self.pageVersion.id(),
            type: "GET",
            dataType: "json",
            async: false
        })
        .done(function (json) {
            // Clean up from previously injected html/scripts
            if (self.pageVersion.pageModelStub != null && typeof self.pageVersion.pageModelStub.cleanUp === 'function') {
                self.pageVersion.pageModelStub.cleanUp();
            }
            self.pageVersion.pageModelStub = null;

            // Remove Old Scripts
            var oldScripts = $('script[data-fields-script="true"]');

            if (oldScripts.length > 0) {
                $.each(oldScripts, function () {
                    $(this).remove();
                });
            }

            var elementToBind = $("#fields-definition")[0];
            ko.cleanNode(elementToBind);

            var result = $(json.Content);

            // Add new HTML
            var content = $(result.filter('#fields-content')[0]);
            var details = $('<div>').append(content.clone()).html();
            $("#fields-definition").html(details);

            // Add new Scripts
            var scripts = result.filter('script');

            $.each(scripts, function () {
                var script = $(this);
                script.attr("data-fields-script", "true");//for some reason, .data("fields-script", "true") doesn't work here
                script.appendTo('body');
            });

            // Update Bindings
            // Ensure the function exists before calling it...
            if (typeof pageModel != null) {
                self.pageVersion.pageModelStub = pageModel;
                if (typeof self.pageVersion.pageModelStub.updateModel === 'function') {
                    self.pageVersion.pageModelStub.updateModel();
                }
                ko.applyBindings(viewModel, elementToBind);
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $.notify(translations.GetRecordError, "error");
            console.log(textStatus + ': ' + errorThrown);
        });

        self.versionValidator.resetForm();
    };

    self.delete = function () {
        if (confirm(translations.DeleteRecordConfirm)) {
            $.ajax({
                url: "/odata/kore/cms/PageApi(guid'" + self.id() + "')",
                type: "DELETE",
                async: false
            })
            .done(function (json) {
                self.refresh();
                $.notify(translations.DeleteRecordSuccess, "success");
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $.notify(translations.DeleteRecordError, "error");
                console.log(textStatus + ': ' + errorThrown);
            });
        }
    };

    self.save = function () {
        var isNew = (self.id() == emptyGuid);

        if (!$("#form-section-form").valid()) {
            return false;
        }

        if (!isNew) {
            if (!$("#form-section-version-form").valid()) {
                return false;
            }
        }

        var record = {
            Id: self.id(),
            ParentId: self.parentId(),
            PageTypeId: self.pageTypeId(),
            Title: self.title(),
            IsEnabled: self.isEnabled(),
            Order: self.order(),
            ShowOnMenus: self.showOnMenus()
        };

        if (isNew) {
            $.ajax({
                url: "/odata/kore/cms/PageApi",
                type: "POST",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(record),
                dataType: "json",
                async: false
            })
            .done(function (json) {
                $.notify(translations.InsertRecordSuccess, "success");
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $.notify(translations.InsertRecordError, "error");
                console.log(textStatus + ': ' + errorThrown);
            });
        }
        else {
            $.ajax({
                url: "/odata/kore/cms/PageApi(guid'" + self.id() + "')",
                type: "PUT",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(record),
                dataType: "json",
                async: false
            })
            .done(function (json) {
                $.notify(translations.UpdateRecordSuccess, "success");
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $.notify(translations.UpdateRecordError, "error");
                console.log(textStatus + ': ' + errorThrown);
            });

            self.saveVersion();
            self.refresh();
        }
    };

    self.saveVersion = function () {

        // ensure the function exists before calling it...
        if (self.pageVersion.pageModelStub != null && typeof self.pageVersion.pageModelStub.onBeforeSave === 'function') {
            self.pageVersion.pageModelStub.onBeforeSave();
        }

        var cultureCode = self.pageVersion.cultureCode();
        if (cultureCode == '') {
            cultureCode = null;
        }

        var status = 'Draft';

        // if not preset to 'Archived' status...
        if (self.pageVersion.status() != 'Archived') {
            // and checkbox for Draft has been set,
            if (self.pageVersion.isDraft()) {
                // then change status to 'Draft'
                status = 'Draft';
            }
            else {
                // else change status to 'Published'
                status = 'Published';
            }
        }

        var record = {
            Id: self.pageVersion.id(),
            PageId: self.pageVersion.pageId(),
            CultureCode: cultureCode,
            Status: status,
            Title: self.pageVersion.title(),
            Slug: self.pageVersion.slug(),
            Fields: self.pageVersion.fields(),
        };

        // UPDATE only (no option for insert here)
        $.ajax({
            url: "/odata/kore/cms/PageVersionApi(guid'" + self.pageVersion.id() + "')",
            type: "PUT",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(record),
            dataType: "json",
            async: false
        })
        .done(function (json) {
            $.notify(translations.UpdateRecordSuccess, "success");
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $.notify(translations.UpdateRecordError, "error");
            console.log(textStatus + ': ' + errorThrown);
        });
    };

    self.cancel = function () {

        // Clean up from previously injected html/scripts
        if (self.pageVersion.pageModelStub != null && typeof self.pageVersion.pageModelStub.cleanUp === 'function') {
            self.pageVersion.pageModelStub.cleanUp();
        }
        self.pageVersion.pageModelStub = null;

        // Remove Old Scripts
        var oldScripts = $('script[data-fields-script="true"]');

        if (oldScripts.length > 0) {
            $.each(oldScripts, function () {
                $(this).remove();
            });
        }

        var elementToBind = $("#fields-definition")[0];
        ko.cleanNode(elementToBind);
        $("#fields-definition").html("");

        switchSection($("#version-grid-section"));

        self.showToolbar(false);
        self.isEditMode(false);

        switchSection($("#blank-section"));
    };

    self.toggleEnabled = function () {
        var patch = {
            IsEnabled: !self.isEnabled()
        };

        $.ajax({
            url: "/odata/kore/cms/PageApi(guid'" + self.id() + "')",
            type: "PATCH",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(patch),
            dataType: "json",
            async: false
        })
        .done(function (json) {
            self.refresh();
            $.notify(translations.UpdateRecordSuccess, "success");
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $.notify(translations.UpdateRecordError, "error");
            console.log(textStatus + ': ' + errorThrown);
        });
    };

    self.showPageVersions = function () {
        self.showToolbar(false);
        self.isEditMode(false);

        var grid = $('#PageVersionGrid').data('kendoGrid');
        if (currentCulture == null || currentCulture == "") {
            grid.dataSource.transport.options.read.url = "/odata/kore/cms/PageVersionApi?$filter=CultureCode eq null and PageId eq guid'" + self.id() + "'";
        }
        else {
            grid.dataSource.transport.options.read.url = "/odata/kore/cms/PageVersionApi?$filter=CultureCode eq '" + currentCulture + "' and PageId eq guid'" + self.id() + "'";
        }
        grid.dataSource.page(1);

        switchSection($("#version-grid-section"));
    };

    self.showPageTypes = function () {
        self.showToolbar(false);
        self.isEditMode(false);
        switchSection($("#page-type-grid-section"));
    };

    self.refresh = function () {
        switchSection($("#blank-section"));
        self.showToolbar(false);
        self.isEditMode(false);
        $("#treeview").data("kendoTreeView").dataSource.read();
    };

    self.preview = function () {
        var win = window.open('/admin/pages/preview/' + self.pageVersion.id(), '_blank');
        if (win) {
            win.focus();
        } else {
            alert('Please allow popups for this site');
        }
        return false;
    };

    self.validator = $("#form-section-form").validate({
        rules: {
            Title: { required: true, maxlength: 255 },
            Order: { required: true, digits: true }
        }
    });

    self.versionValidator = $("#form-section-version-form").validate({
        rules: {
            Version_Title: { required: true, maxlength: 255 },
            Version_Slug: { required: true, maxlength: 255 }
        }
    });
};

var viewModel;
$(document).ready(function () {
    viewModel = new ViewModel();
    ko.applyBindings(viewModel);

    switchSection($("#blank-section"));

    $("#PageTypesGrid").kendoGrid({
        data: null,
        dataSource: {
            type: "odata",
            transport: {
                read: {
                    url: "/odata/kore/cms/PageTypeApi",
                    dataType: "json"
                }
            },
            schema: {
                data: function (data) {
                    return data.value;
                },
                total: function (data) {
                    return data["odata.count"];
                },
                model: {
                    fields: {
                        Name: { type: "string" }
                    }
                }
            },
            pageSize: gridPageSize,
            serverPaging: true,
            serverFiltering: true,
            serverSorting: true,
            sort: { field: "Name", dir: "asc" }
        },
        filterable: true,
        sortable: {
            allowUnsort: false
        },
        pageable: {
            refresh: true
        },
        scrollable: false,
        columns: [{
            field: "Name",
            title: translations.Columns.PageType.Name,
            filterable: true
        }, {
            field: "Id",
            title: " ",
            template:
                '<a onclick="viewModel.pageType.edit(\'#=Id#\')" class="btn btn-default btn-xs">' + translations.Edit + '</a>',
            attributes: { "class": "text-center" },
            filterable: false,
            width: 130
        }]
    });

    $("#PageVersionGrid").kendoGrid({
        data: null,
        dataSource: {
            type: "odata",
            transport: {
                read: {
                    url: "/odata/kore/cms/PageVersionApi?$filter=CultureCode eq null",
                    dataType: "json"
                }
            },
            schema: {
                data: function (data) {
                    return data.value;
                },
                total: function (data) {
                    return data["odata.count"];
                },
                model: {
                    fields: {
                        Title: { type: "string" },
                        DateModifiedUtc: { type: "date" },
                        IsEnabled: { type: "boolean" }
                    }
                }
            },
            pageSize: gridPageSize,
            serverPaging: true,
            serverFiltering: true,
            serverSorting: true,
            sort: { field: "DateModifiedUtc", dir: "desc" }
        },
        filterable: true,
        sortable: {
            allowUnsort: false
        },
        pageable: {
            refresh: true
        },
        scrollable: false,
        columns: [{
            field: "Title",
            title: translations.Columns.PageVersion.Title,
            filterable: true
        }, {
            field: "DateModifiedUtc",
            title: translations.Columns.PageVersion.DateModifiedUtc,
            filterable: true,
            width: 200,
            type: "date",
            format: "{0:G}"
        }, {
            field: "Id",
            title: " ",
            template:
                '<a onclick="viewModel.pageVersion.edit(\'#=Id#\')" class="btn btn-default btn-xs">' + translations.Edit + '</a>',
            attributes: { "class": "text-center" },
            filterable: false,
            width: 130
        }]
    });

    var treeviewDS = new kendo.data.HierarchicalDataSource({
        type: "odata",
        transport: {
            read: {
                url: "/odata/kore/cms/PageTreeApi?$expand=SubPages/SubPages",
                dataType: "json"
            }
        },
        schema: {
            data: function (response) {
                return response.value;
            },
            total: function (response) {
                return response.value.length;
            },
            model: {
                id: "Id",
                children: "SubPages"
            }
        }
    });

    $("#treeview").kendoTreeView({
        template: kendo.template($("#treeview-template").html()),
        dragAndDrop: true,
        dataSource: treeviewDS,
        dataTextField: ["Title"],
        loadOnDemand: false,
        dataBound: function (e) {
            setTimeout(function () {
                $("#treeview").data("kendoTreeView").expand(".k-item");
            }, 20);
        },
        drop: function (e) {
            var sourceDataItem = this.dataItem(e.sourceNode);
            var sourceId = sourceDataItem.id;
            var destinationDataItem = this.dataItem(e.destinationNode);
            var destinationId = destinationDataItem.id;
            var dropPosition = e.dropPosition;

            if (destinationId == sourceId) {
                // A page cannot be a parent of itself!
                return;
            }

            var parentId = null;
            var destinationPage = null;

            if (viewModel.id() == destinationId) {
                destinationPage = {
                    Id: viewModel.id(),
                    ParentId: viewModel.parentId()
                };
            }
            else {
                $.ajax({
                    url: "/odata/kore/cms/PageApi(guid'" + destinationId + "')",
                    type: "GET",
                    dataType: "json",
                    async: false
                })
                .done(function (json) {
                    destinationPage = {
                        Id: json.Id,
                        ParentId: json.ParentId
                    };
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    $.notify(translations.GetRecordError, "error");
                    console.log(textStatus + ': ' + errorThrown);
                    return;
                });
            }

            if (destinationPage.ParentId == sourceId) {
                $.notify(translations.CircularRelationshipError, "error");
                $("#treeview").data("kendoTreeView").dataSource.read();
                return;
            }

            switch (dropPosition) {
                case 'over':
                    parentId = destinationId;
                    break;
                default:
                    parentId = destinationPage.ParentId;
                    break;
            }

            var patch = {
                ParentId: parentId
            };

            $.ajax({
                url: "/odata/kore/cms/PageApi(guid'" + sourceId + "')",
                type: "PATCH",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(patch),
                dataType: "json",
                async: false
            })
            .done(function (json) {
                $("#treeview").data("kendoTreeView").dataSource.read();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $.notify(translations.UpdateRecordError, "error");
                console.log(textStatus + ': ' + errorThrown);
            });
        }
    });
});
const admins_schema = require('./AdminSchema')
const affliated_colleges_schema = require('./AffliatedCollegesSchema')
const notification_updates_schema = require('./UpdatesSchema')
const dmc_upload_schema = require('./DMCUploadSchema')
const event_photos_table = require('./EventPhotosSchema')
const carousel_photos_table=  require('./CarouselSchema')
const gallery_requests_table =require('./galleryRequestsSchema')
const directors_table = require('./DirectorsSchema')
const admin_email_allowlist = require('./AdminEmailAllowlistSchema')
const admin_profile_schema = require('./AdminProfileSchema')

exports.allSchemas = ()=>{
    
    admins_schema.admin_table()
    notification_updates_schema.notification_updates_table()
    affliated_colleges_schema.affiliated_colleges_table()
    dmc_upload_schema.dmc_upload_table()
    event_photos_table.event_photos_table()
    carousel_photos_table.carousel_photos_table()
    gallery_requests_table.gallery_requests()
    directors_table.directors_table()
    admin_email_allowlist.admin_email_allowlist_table()
    admin_profile_schema.admin_profile_table()

}

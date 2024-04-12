const admins_schema = require('./AdminSchema')
const affliated_colleges_schema = require('./AffliatedCollegesSchema')
const notification_updates_schema = require('./UpdatesSchema')
const dmc_upload_schema = require('./DMCUploadSchema')
const event_photos_table = require('./EventPhotosSchema')
const carousel_photos_table=  require('./CarouselSchema')

exports.allSchemas = ()=>{
    
    admins_schema.admin_table()
    notification_updates_schema.notification_updates_table()
    affliated_colleges_schema.affiliated_colleges_table()
    dmc_upload_schema.dmc_upload_table()
    event_photos_table.event_photos_table()
    carousel_photos_table.carousel_photos_table()

}

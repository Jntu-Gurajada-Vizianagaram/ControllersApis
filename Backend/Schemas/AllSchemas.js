const admins_schema = require('./AdminSchema')
const affliated_colleges_schema = require('./AffliatedCollegesSchema')
const notification_updates_schema = require('./UpdatesSchema')

exports.allSchemas = ()=>{
    
    admins_schema.admin_table()
    notification_updates_schema.notification_updates_table()
    affliated_colleges_schema.affiliated_colleges_table()

}
